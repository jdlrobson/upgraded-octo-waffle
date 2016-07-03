// app-server.js
import React from 'react'
import { match, RoutingContext } from 'react-router'
import ReactDOMServer from 'react-dom/server'
import express from 'express'
import hogan from 'hogan-express'

import NodeCache from 'node-cache';

// Routes
import routes from './../client/routes'

// Express
const app = express()
app.engine('html', hogan)
app.set('views', __dirname + '/views')

app.use('/', express.static(__dirname + '/../../public/'))
app.set('port', (process.env.PORT || 3000))

// cache is valid for up to 10 minutes
var shortLifeCache = new NodeCache( { stdTTL: 60 * 10, checkperiod: 60 * 10 } );

var WikiSocketCollection = require( 'WikiSocketCollection' );
var collection = new WikiSocketCollection( {
  id: 'mysocket',
  project: '*.wikipedia.org',
  minPurgeTime: 20,
  maxLifeSpan: ( 60 * 24 ) * 7,
  maxInactivity: ( 60 * 24 ) * 7,
  minSpeed: 0.1
} );

function calcScore( q ) {
  return ( ( ( q.edits - q.anonEdits - q.reverts ) + ( q.anonEdits * 0.1 ) ) / q.getBias() )
    * ( q.contributors.length / 2 );
}

function getSortedPages() {
  // FIXME: This should be cached for a fixed window e.g. 5 minutes?
  var p = collection.getPages();
  return p.sort( function ( q, r ) {
    return calcScore( q ) > calcScore( r ) ? -1 : 1;
  } );
}

function annotate( p, filter, limit ) {
  var res = [];
  p.some( function ( item, i ) {
    if ( !item.wiki ) {
      item.wiki = 'enwiki';
    }
    if ( i >= limit ) {
      return true;
    } else if ( filter && filter( item ) ) {
      var score =  calcScore( item );
      var speed = item.editsPerMinute();

      item.index = i + 1;
      if ( !item.bestIndex ) {
        item.bestIndex = item.index;
      } else if ( item.index > item.bestIndex ) {
        item.bestIndex = item.index;
      }
      item.bias = item.getBias();
      item.score = score;
      // Mark trending ones as safe until end of lifespan
      // Note: a speed of 0.2 after 5 minutes is equivalent to 1 edit every minute.
      if ( speed > 0.2 && item.bias < 0.6 && item.age() > 5 && item.contributors.length > 2 ) {
        console.log( 'Marked', item.title, 'as safe');
        collection.markSafe( item.id );
      }
      res.push( item );
    }
  } );
  return res;
}

app.get('/api/trending/safe/',(req, res) => {
  res.status(200);
  res.setHeader('Content-Type', 'application/json');

  shortLifeCache.get( cacheKey, function( err, responseText ) {
    var responseText;
    if ( err || !responseText ) {
      fn = function ( item ) {
        return item.safe;
      };
      responseText = JSON.stringify( {
        results: annotate( getSortedPages(), fn, 100 ), ts: new Date()
      } );
      shortLifeCache.set( cacheKey, responseText );
    }
    res.send( responseText );
  } );
} )


app.get('/api/trending/:wiki?',(req, res) => {
  var filter;
  var wiki = req.params.wiki || 'enwiki';
  var cacheKey = 'trending/' + wiki;

  res.status(200);
  res.setHeader('Content-Type', 'application/json');

  shortLifeCache.get( cacheKey, function( err, responseText ) {
    var responseText;
    if ( err || !responseText ) {
      fn = function ( item ) {
        var wiki = filter;
        return wiki === '*' || item.wiki === wiki;
      };
      responseText = JSON.stringify( {
        results: annotate( getSortedPages(), fn, 100 ), ts: new Date()
      } );
      shortLifeCache.set( cacheKey, responseText );
    }
    res.send( responseText );
  } );
} )


app.get('/api/:lang/:title',(req, res, match) => {
  // FIXME: Handle this better please. Use better API.
  var lang = req.params.lang;
  var url = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/mobile-sections/' + encodeURIComponent( req.params.title );
  fetch( url )
    .then( function ( resp ) {
      return resp.json();
    } )
    .then( function ( data ) {
      var page = {
        title: data.lead.displaytitle,
        content: data.lead.sections.length ? data.lead.sections[0].text : ':-('
      };
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.send( JSON.stringify( page ) );
    } );
} );

app.get('*',(req, res) => {

	// use React Router
  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    // TODO:
    const reactMarkup = ReactDOMServer.renderToStaticMarkup(<RoutingContext {...renderProps}/>)
		// TO DO:
    res.locals.reactMarkup = reactMarkup

    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      
      // Success!
      res.status(200).render('index.html')
    
    } else {
      res.status(404).render('index.html')
    }
  })
})

app.listen(app.get('port'))

console.info('==> Server is listening in ' + process.env.NODE_ENV + ' mode')
console.info('==> Go to http://localhost:%s', app.get('port'))

