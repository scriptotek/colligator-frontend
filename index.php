<?php
function getDataSource() {
    $ip = isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : (
            isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : (
              isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''
            )
          );

    switch ($ip) {
        case '129.240.239.186':
            return 'ubreal48';
        default:
            return 'web';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Samling 42</title>
    <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="css/carouseal.css">
    <link rel="stylesheet" href="bower_components/backbone-modal/backbone.modal.css">
    <link rel="stylesheet" href="bower_components/backbone-modal/backbone.modal.theme.css">
    <link rel="stylesheet" href="css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=0.35, maximum-scale=0.35, user-scalable=no">
</head>
<body>

<div class="container">
    <div class="row">
        <h1 class="text-center" id="pageTitle" style="margin-bottom:.6em;">Samling 42</h1>
    </div>
</div>

<div class="container text-center" id="startView"></div>

<div class="container">
    <div class="row">
        <!-- Usig .btn-group-justified to make the three elements equal size. This helped solve issue #56 because text overflowing the button width is now hidden. -->
        <div class="col-sm-12  btn-group-justified">
            <div class="btn-group text-left">
                <button type="button" class="btn btn-lg btn-info hide-overflow" id="previousEmneord"></button>
            </div>
            <div class="btn-group text-center">
                <h2 id="currentEmneord"></h2>
            </div>
            <div class="btn-group text-right">
                <button type="button" class="btn btn-lg btn-info hide-overflow" id="nextEmneord"></button>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid">

    <div class="loader" title="0">
        <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="100px" height="100px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">
        <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
        s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
        c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
        <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
        C22.32,8.481,24.301,9.057,26.013,10.047z">
            <animateTransform
                attributeType="xml"
                attributeName="transform"
                type="rotate"
                from="0 20 20"
                to="360 20 20"
                dur="0.5s"
                repeatCount="indefinite"/>
        </path>
        </svg>
    </div>

    <div id="books"></div>

    <div id="help"></div>

</div>

<div class="container">
    <div id="errormessage"></div>
    <div id="bookFull"></div>
    <div class="row">
        <p class="handParagraph">
            <img id="touchHand" height="450px" class="animateHand" src="swipeIcon.png" alt="">
        </p>
    </div>
</div>

<footer class="footer">
	<div class="container">
		<div class="row">
			<div class="col-sm-3">
                <p class="text-left">
                    <a href="./" onclick="javascript:ga('send', 'event', 'BookView', 'TapHomeIcon');"><span id="homeIcon" class="glyphicon glyphicon-home glyphicon-large" aria-hidden="true"></span></a>
                </p>
            </div>
			<div class="col-sm-6">
<!--                 <p class="text-left">
                    <img src="strekkodeleser.jpg" height="150" alt="">
                </p> -->
            </div>
			<div class="col-sm-3">
				<p class="text-right">
					<span id="helpIcon" class="glyphicon glyphicon-question-sign glyphicon-large" aria-hidden="true"></span>			
				</p>
			</div>
		</div>
	</div>
</footer>

<script src="https://cdn.ravenjs.com/3.14.0/raven.min.js"></script>
<script src="bower_components/jquery/dist/jquery.js"></script>
<script src="bower_components/underscore/underscore.js"></script>
<script src="bower_components/backbone/backbone.js"></script>
<script src="bower_components/hammerjs/hammer.js"></script>
<script src="bower_components/backbone-modal/backbone.modal.js"></script>
<script src="carouseal.js"></script>

<script id="startTemplate" type="text/template">
    <p>Her kan du begynne å utforske samlingen. Velg et emne...</p>

    <!-- Fysikk / astro -->
    <button type="button" data-emneord="Fysikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Fysikk</button>
    <button type="button" data-emneord="Energi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Energi</button>
    <button type="button" data-emneord="Relativitetsteorien" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Relativitetsteorien</button>
    <button type="button" data-emneord="Astronomi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Astronomi</button>
    <button type="button" data-emneord="Sorte hull" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Sorte hull</button>

    <!-- Filosofi -->
    <button type="button" data-emneord="Filosofi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Filosofi</button>
    <button type="button" data-emneord="Tidsbegrepet" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Tidsbegrepet</button>

    <!-- Biologi -->
    <button type="button" data-emneord="Biologi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Biologi</button>
    <button type="button" data-emneord="Evolusjonsteorien" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Evolusjonsteorien</button>
    <button type="button" data-emneord="Genetikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Genetikk</button>
    <button type="button" data-emneord="Økologi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Økologi</button>

    <!-- Geologi -->
    <button type="button" data-emneord="Geologi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Geologi</button>

    <!-- Informatikk -->
    <button type="button" data-emneord="Informatikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Informatikk</button>
    <button type="button" data-emneord="Kunstig intelligens" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Kunstig intelligens</button>

    <!-- Matematikk -->
    <button type="button" data-emneord="Matematikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Matematikk</button>
    <button type="button" data-emneord="Populærmatematikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Populærmatematikk</button>
    <button type="button" data-emneord="Matematikkhistorie" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Matematikkhistorie</button>
    <button type="button" data-emneord="Knuteteori" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Knuteteori</button>

    <!-- Kjemi -->
    <button type="button" data-emneord="Kjemi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Kjemi</button>
    <button type="button" data-emneord="Kjemihistorie" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Kjemihistorie</button>
    <button type="button" data-emneord="Gastronomi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Gastronomi</button>

    <!-- Resten -->
    <button type="button" data-emneord="Medisin" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Medisin</button>
    <button type="button" data-emneord="Oppfinnelser" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Oppfinnelser</button>
    <button type="button" data-emneord="Politikk" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Politikk</button>
    <button type="button" data-emneord="Miljø" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Miljø</button>

    <button type="button" data-emneord="Psykologi" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Psykologi</button>
    <button type="button" data-emneord="Hobbyer" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Hobbyer</button>
    <button type="button" data-emneord="Kunst" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Kunst</button>

    <button type="button" data-emneord="Vitenskapshistorie" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Vitenskapshistorie</button>
    <button type="button" data-emneord="Vitenskapelig forfatterskap" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Vitenskapelig forfatterskap</button>
    <button type="button" data-emneord="Formidling" class="emneord emneord-topic btn btn-lg btn-info"><em></em>Formidling</button>

    <p>… et sted …</p>

    <button type="button" data-emneord="Norge" class="emneord emneord-geographic btn btn-lg btn-info"><em></em>Norge</button>
    <button type="button" data-emneord="Antarktis" class="emneord emneord-geographic btn btn-lg btn-info"><em></em>Antarktis</button>
    <button type="button" data-emneord="Kina" class="emneord emneord-geographic btn btn-lg btn-info"><em></em>Kina</button>
    <button type="button" data-emneord="Storbritannia" class="emneord emneord-geographic btn btn-lg btn-info"><em></em>Storbritannia</button>


    <p>… en person …</p>

    <button type="button" data-emneord="Newton, Isaac" class="emneord emneord-person btn btn-lg btn-info"><em></em>Isaac Newton</button>
    <button type="button" data-emneord="Darwin, Charles (1809-1882)" class="emneord emneord-person btn btn-lg btn-info"><em></em>Charles Darwin</button>
    <button type="button" data-emneord="Copernicus, Nicolaus" class="emneord emneord-person btn btn-lg btn-info"><em></em>Nicolaus Copernicus</button>
    <button type="button" data-emneord="Linné, Carl von" class="emneord emneord-person btn btn-lg btn-info"><em></em>Carl von Linné</button>
    <button type="button" data-emneord="Abel, Niels Henrik (1802-1829)" class="emneord emneord-person btn btn-lg btn-info"><em></em>Niels Henrik Abel</button>
    <button type="button" data-emneord="Curie, Marie" class="emneord emneord-person btn btn-lg btn-info"><em></em>Marie Curie</button>
    <button type="button" data-emneord="Faraday, Michael" class="emneord emneord-person btn btn-lg btn-info"><em></em>Michael Faraday</button>

    <p>… eller kanskje en form …</p>

    <button type="button" data-emneord="Humor" class="emneord emneord-form btn btn-lg btn-info"><em></em>Humor</button>
    <button type="button" data-emneord="Biografier" class="emneord emneord-form btn btn-lg btn-info"><em></em>Biografier</button>
    <button type="button" data-emneord="Sitatsamlinger" class="emneord emneord-form btn btn-lg btn-info"><em></em>Sitatsamlinger</button>
    <button type="button" data-emneord="Skjønnlitteratur" class="emneord emneord-form btn btn-lg btn-info"><em></em>Skjønnlitteratur</button>
    <button type="button" data-emneord="Dikt" class="emneord emneord-form btn btn-lg btn-info"><em></em>Dikt</button>
    <button type="button" data-emneord="Bildeverk" class="emneord emneord-form btn btn-lg btn-info"><em></em>Bildeverk</button>
    <button type="button" data-emneord="Tegneserier" class="emneord emneord-form btn btn-lg btn-info"><em></em>Tegneserier</button>
    <button type="button" data-emneord="Reiseskildringer" class="emneord emneord-form btn btn-lg btn-info"><em></em>Reiseskildringer</button>

</script>

<script id="errorMessageTemplate" type="text/template">
    <div class="alert alert-danger" role="alert">

        <span style="font-size:42px">
            <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
            <%= error %>
        </span>

    </div>
</script>

<script id="bookListTemplate" type="text/template">
    <img src="<%= cover %>" data-url="<%= id %>" id="b<%= id %>" alt="">
</script>

<script id="bookFullTemplate" type="text/template">
    <hr>
    <div class="container text-center">
        <h3 id="bookTitle"><%= mainTitle %></h3>
        <% if(typeof(subTitle) !== "undefined") { %>
        	<h4><%= subTitle.capitalizeFirstLetter() %></h4>
        <% } %>
        <div id="bookInfoExtended">
            <p>
            	<small>
            		Av: <%= authors %>
            		<br><%= publisher %>, <%= year %>
    		        <% if (typeof(part_name) !== "undefined" && typeof(part_no) !== "undefined") { %>
    					<br><%= part_no %> av <%= part_name %>.
    		        <% } %>
            	</small>
            </p>
            <% if (available) { %>
                <p class="alert alert-success"><%= availableText %></p>
            <% } else { %>
                <p class="alert alert-danger"><%= availableText %></p>
            <% } %>
            <% if (ebook) { %>
                <p class="alert alert-success"><%= ebookText %></p>
            <% }%>
            <% if (typeof(description)!=="undefined") { %>
            	<p id="bookDescription"><%= description.text %></p>
            <% } %>
            <div class="text-center">
                <% _.each(emneord, function(subject) { %>
                    <% if (subject.prefLabel === currentEmneord) { %>
                        <button type="button" class="emneord emneord-<%= subject.type %> btn btn-lg btn-default"><em></em><%= subject.prefLabel %></button>
                    <% } else { %>
                        <button type="button" class="emneord emneord-<%= subject.type %> btn btn-lg btn-info"><em></em><%= subject.prefLabel %></button>
                    <% } %>
                <% }); %>
            </div>
<!--            <a href="/colligator/api/documents/<%= id %>" style="color:#ddd; font-size:80%; float:right;"><%= id %></a> for debugging -->

        </div>
    </div>
</script>

<script type="text/template" id="helpModal">
    <div class="bbm-modal__topbar">
      <h3 class="bbm-modal__title">#samling42</h3>
    </div>
    <div class="bbm-modal__section">
      <p>Noen tips:</p>
      <ul>
        <li>Sveip til høyre eller venstre for å komme til en ny bok.</li>
        <li>Trykk på et emneord under den aktive boka for å vise flere bøker om samme emne.</li>
      </ul>

      <p>
        Samling 42 er en samling for alle med interesse for generell naturvitenskap.
        Den ble påbegynt i 1972, og vi kjøper inn nye bøker fortløpende
        (når vi har penger).
      </p>
      <p>
          Samlingen rommer populærvitenskap, vitenskapsfilosofi, -historie, -sosiologi og -etikk, vitenskapelig forfatterskap, barnebøker, og det meste egentlig.
        </p>
      <p style="font-size:80%; line-height: 140%;">
          Karusellen du ser på nå består av åpen kildekode-komponentene
          Carouseal og Colligator, som ble utviklet frem til første
          brukbare versjon av Dan Michael O. Heggø, Kyrre T. Låberg og Stian Lågstad
          sommeren 2015.
      </p>
      <p style="font-size:80%; line-height: 140%;">
          Data: Bokomtaler og -omslag fra Nielsen BookData (begrenset bruk),
          Open Library, Google Books (begrenset bruk),
          bibliografiske data fra Bibsys (NLOD) og autoritetsdata
          fra Realfagstermer (CC0).
      </p>
    </div>
    <div class="bbm-modal__bottombar">
      <a href="#" class="bbm-button">Ok</a>
    </div>
  </script>


<!-- Analytics -->
<script>

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-72054416-5', {
    storage: 'none',  // Don't use tracking cookie
    forceSSL: true,
  });

  ga('set', 'dataSource', '<?php echo getDataSource(); ?>');

  function useIppProxy() {
        // Modifies sendHitTask to hit ipproxy
        ga(function(tracker) {
            tracker.set('sendHitTask', function(model) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '//w3prod-ipproxy.uio.no/collect?' + model.get('hitPayload'), true);
                xhr.send();
            });
        });
  }
  // useIppProxy();
</script>


<script type="text/javascript">

"use strict";

Raven.config('https://c3cbca03730b40fab785ef602eaa77c4@sentry.io/157266').install();

// Extending String so that we can easily capitalize the first letter
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

try {
(function() {

	//Disable zoom by disabling touchmove when two fingers are used: event.touches.length>1
	window.addEventListener('touchmove', function(event){
		
		if (event.touches.length>1){
			event.preventDefault();
		}	
	}, {passive:false});
	//

  // ------ BEGIN LAST MINUTE FIXES FOR KIOSK MODE ---------
  // Disable right click
  window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };
  // Multitap on header to reload
  (new Hammer($('h1')[0],{preventDefault: true}))
  .on('tap',function(ev){
        if (ev.tapCount === 6) {
            window.location.reload();
        }
  });
  // ------- END LAST MINUTE FIXES FOR KIOSK MODE -----------


// ---------------------------------------- DEFINE MODEL + COLLECTION

var Book = Backbone.Model.extend({
    defaults: {
        title: '',
        isbn: '',
        authors: '',
        publisher: '',
        year: ''
        // cover: 'http://snyderstreasures.com/images/thumbnails/germanmilitaria/books/BookReichsblattPlainC_small.jpg'
    }
});

var Books = Backbone.Collection.extend({
    model: Book,
    url: '/colligator/api/documents',
    parse: function(response, options) {

        // Remove books that:
        //   has no holdings
        //   has no cover
        var data = _.reject(response.documents, function(element) {
            return !element.holdings || element.holdings.length === 0; // || element.cover===null;
        });

        var maxBooks = 30;

        if (data.length > maxBooks) {
            data = _.reject(response.documents, function(element) {
                return element.cover===null;
            });
        }

        if (data.length > maxBooks) {
            data = data.slice(0, maxBooks);
        }

        console.log(data.length + ' books after filtering');

        // Filter and modify data
        data = _.map(data, function(val, ind, all) {

            // Set simpler key for cover
            if (val.cover) {
                val.cover = val.cover.thumb.url;
            } else {
                val.cover = 'assets/blank-cover.jpg';
            }

            // Remove the description key if there's no description, because then it's easier to test whether or not to show the description in #bookFullTemplate
            if (val.description===null) {
            	delete val.description;
            }

            // Remove the emneord Naturvitenskap from the list of emneord because almost all books has that emneord
            val.subjects.noubomn = _.reject(val.subjects.noubomn, function(emneord) {
                return emneord.prefLabel==='Naturvitenskap';
            });

            return val;
        });

        return data;
    }
});

// ---------------------------------------- DEFINE VIEWS

var StartView = Backbone.View.extend({
    el: '#startView',
    render: function() {

        var template; // Will hold the compiled template
        var html; // Will hold the result of template(data)

        // Create template function
        template = _.template($('#startTemplate').html());
        // Give data to template function and produce html. No input data for the template here for now
        html = template();
        // Insert produced html into the view element
        this.$el.append(html);

        return this;
    },
    events: {
        'click .emneord': 'onEmneOrdClick'
    },
    // This is for when a new emneord has been selected
    onEmneOrdClick: function(e) {
        var $li = $(e.target);

        ga('send', 'event', 'StartView', 'TapSubject', $li.attr('data-emneord'));

        // Change URL and trigger route handler
        router.navigate('cat/'+$li.attr('data-emneord'), {
            trigger: true,
            emneord: $li.attr('data-emneord')
        });

        // Remove this view
        this.remove();
        this.unbind();
    }
});

var BookView = Backbone.View.extend({
    tagName: 'li',
    className: 'book',
    render: function() {

        var template; // Will hold the compiled template
        var html; // Will hold the result of template(data)

        // Create template function
        template = _.template($('#bookListTemplate').html());
        // Give data to template function and produce html
        html = template(this.model.toJSON());
        // Insert produced html into the view element
        this.$el.append(html);

        return this;
    }
});

var BooksView = Backbone.View.extend({
    el: '#books',
    className: 'books',
    render: function(rotateTo) {

        // Remove old views
        this.removeOldViews();
        // Empty content in case carouseal left something
        this.$el.empty();

        // Create new views IF we have books
        if (books.length>0) {

            // Hide any previously shown error message
            errorMessageView.$el.hide();

            var self = this;
            this.model.each(function(book) {
                var bookView = new BookView({ model: book });
                // Store reference to the created view to make it easier to remove it later
                self._views.push(bookView);
                self.$el.append(bookView.render().$el);
            });

            // Now that we have the images in the div, convert them to a carousel
            carouSeal.element = $("#books");
            carouSeal.initCarousel(rotateTo);
            //carouSeal.autoRotate(null,3000);
            carouSeal.autoRotate();

        } else {
            // Make sure the errormessagediv is shown
            errorMessageView.$el.show();
            errorMessageView.render('Ingen bøker funnet for emneordet «' + books._emneord + '».');
            console.log('No books found for this emneord.');
        }

        return this;
    },
    initialize: function(options) {
        // Store reference to subviews created in render(), as we need to remove them when rerendering
        this._views = [];

    },
    // Thoroughly remove subviews. Tip gotten from:
    // http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
    removeOldViews: function() {
        _.each(this._views, function(view) {
            view.remove();
            view.unbind();
        });
    }
});

var BookFullView = Backbone.View.extend({
    el: '#bookFull',
    initialize: function() {
        // This variable decides if #bookInfoExtended is showed or not in this.render()
        this._hideExtended = false;
    },
    getSubjects: function (model) {
        // Max 12 of each type
        var s1 = (model.get('subjects').noubomn || []).slice(0,12);
        var s2 = (model.get('genres').noubomn || []).slice(0,12).map(function(sub) {
            sub['type'] = 'form';
            return sub;
        });
        var s3 = (model.get('subjects').NOTrBIB || []).slice(0,12);
        return s1.concat(s2).concat(s3);
    },
    render: function() {

        var template; // Will hold the compiled template
        var html; // Will hold the result of template(data)

        // Only render if we have a model
        if (this.model != null) {

            // Create a print-friendly attribute for the author names
            var authors = '';
            _.each(this.model.get('creators'), function(creator) {
                authors = authors.concat(', '+creator.name);
            });
            authors = authors.concat('.');
            authors = authors.substr(2); // Remove starting ', '
            // Store in model
            this.model.set('authors', authors);

            // The titles sometimes comes in as "Main title : subtitle : third title". We want that to display as mainTitle:"Main title" and the rest as restTitle:"subtitle : third title". In other words: Keep everything before the first " : " as the main title, and add the rest up as the subtitle if there is anything else.
            var titles = this.model.get('title').split(' : ');
            this.model.set('mainTitle', titles[0]);
            if (titles.length > 1) {
                this.model.set('subTitle', titles.splice(1).join(' : '));
            }

            // Store the current emneord in the model so that it's retrievable from the template
            this.model.set('currentEmneord', bookFullView.currentEmneord);

            // TODO: 'availability'-koden under er såpass lang at det er ryddigere om den skilles ut
            //       i en egen funksjon

            // Decide what the availability-text will be. Four possible cases:
            // 1. Book is in 42-collection and available.
            // 2. Book is at UREAL and available.
            // 3. Book is at UBO and available.
            // 4. Book is not available.
            var availableText = '';
            var available = true;
            // Check for case 1
            var available42 = _.findWhere(this.model.get('holdings'), {
                shelvinglocation: 'k00475',
                circulation_status: 'Available'
            });
            // Check for case 2
            var availableUREAL = _.findWhere(this.model.get('holdings'), {
                location: '1030310',
                circulation_status: 'Available'
            });
            // Check for case 3
            var availableUBO = _.findWhere(this.model.get('holdings'), {
                circulation_status: 'Available'
            });
            if (available42) {
                availableText = 'Boka skal stå på hylla. Se etter ' + available42.callcode;
            } else if (availableUREAL) {
                availableText = 'Utlånt, men boka skal finnes et annet sted i biblioteket. Se (eller spør) etter ' + availableUREAL.shelvinglocation + ' ' + availableUREAL.callcode;
            } else if (availableUBO) {
                availableText = 'Utlånt, men boka skal finnes et annet sted på Universitetsbiblioteket, nærmere bestemt ' + availableUBO.shelvinglocation + ' ' + availableUBO.callcode;
            } else {
                available = false;
                availableText = 'Boka er utlånt. Ta kontakt med skranken om du vil reservere den.';
            }
            this.model.set('available', available);
            this.model.set('availableText', availableText);

            this.model.set('emneord', this.getSubjects(this.model));

            // Is the book available as an ebook? If so we create a text for it
            if (typeof(this.model.get('other_form'))!=="undefined" && this.model.get('other_form').fulltext.access===true) {
                this.model.set('ebook', true);
                this.model.set('ebookText', 'Denne boka finnes også som ebok fra ' + this.model.get('other_form').fulltext.linktext);
            } else {
                this.model.set('ebook', false);
            }

            // Create template function
            template = _.template($('#bookFullTemplate').html());
            // Give data to template function and produce html
            html = template(this.model.toJSON());
            // Insert produced html into the view element
            this.$el.html(html);

            // If we are currently autorotating, hide extended bookinfo
            if (this._hideExtended) {
                $('#bookInfoExtended').hide();
            }

            // Give the element an id
            this.$el.attr('id', 'bookFull'+this.model.get('id'));
            // Give each emneord element a data-url and a data-emneord attribute
            _.each(this.$('.emneord'), function(el, i, li) {
                var $listItem = $(el);
                // Give data-emneord
                $listItem.attr('data-emneord', $listItem.text());
                // Give data-url
                $listItem.attr('data-url', 'cat/'+$listItem.text());
            });
            this.$el.attr('data-url', this.model.get('id'));

        } else {
            this.$el.html('');
        }

        return this;
    },
    events: {
        'click .emneord': 'onEmneOrdClick'
    },
    // This is for when a new emneord has been selected
    onEmneOrdClick: function(e) {
        // Since we've clicked an "entirely new" emneord, get rid of any old history
        router.emneordHistory = router.emneordHistory.slice(0, router.emneordHistoryIndex + 1);

        var $li = $(e.target);

        ga('send', 'event', 'BookView', 'TapSubject', $li.attr('data-emneord'));

        // Change URL and trigger route handler
        router.navigate($li.attr('data-url'), {
            trigger: true,
            emneord: $li.attr('data-emneord')
        });

    }
});



var ErrorMessageView = Backbone.View.extend({
    el: '#errormessage',
    render: function(message) {

        var template; // Will hold the compiled template
        var html; // Will hold the result of template(data)

        // Create template function
        template = _.template($('#errorMessageTemplate').html());
        // Give data to template function and produce html
        html = template({ error: message});
        // Insert produced html into the view element
        this.$el.html(html);

        Raven.captureMessage(message);

        return this;
    }
});

// ---------------------------------------- DEFINE ROUTER

var AppRouter = Backbone.Router.extend({
    initialize: function(options) {
        // Store reference to book collection
        this.books = options.books;

        this.emneordHistory = [];
        this.emneordHistoryIndex = -1;

        this.idle = false;

        // TODO: The initial 'listenForActiveItem' event is not triggered
        // [#48] by a user swipe, so we ignore that for analytics. It should
        //       probably be the responsibility of Carouseal to indicate 
        //       whether an event is triggered by a swipe or not though.
        this.initialActiveItemEvent = true;

        // Add listener for the rotate-event
        var self = this;
        $("#books").on('listenForActiveItem', function (e, bookId) {
            // We gave the images ids like "b345". We just want the number:
            bookId = bookId.substr(1);
            // Get the bookModel with this bookId
            var book = books.findWhere({ id: Number(bookId) });
            // Update the model and render
            bookFullView.model = book;
            bookFullView.currentEmneord = books._emneord;
            bookFullView.render();

            // TODO: Simplify
            if (!self.idle) {
                if (this.initialActiveItemEvent) {
                    this.initialActiveItemEvent = false;
                } else {
                    ga('send', 'event', 'BookView', 'SwipeToBook', 'Book: ' + bookId);
                }
            }

            // Update url
            self.navigate('cat/' + books._emneord + '/' + bookId);
        });

        // Add listener for key left/right
        $("#books").on('keyLeft', function(e) {
        	carouSeal.rotatePrev();
        });
        $("#books").on('keyRight', function(e) {
            carouSeal.rotateNext();
        });

        // Handlers for autoRotate
        $('#books').on('autoRotateStart', function(e) {
            $('.handParagraph').show();
            $('#helpIcon').hide();
            $('#homeIcon').hide();
            $('#bookInfoExtended').hide();
            bookFullView._hideExtended = true;
            if (!self.idle) {
                self.idle = true;
                ga('send', 'event', 'BookView', 'Idle');
            }
        });
        $('#books').on('autoRotateStop', function(e) {
            $('.handParagraph').hide();
            $('#helpIcon').show();
            $('#homeIcon').show();
            $('#bookInfoExtended').show();
            if (self.idle) {
                self.idle = false;
                ga('send', 'pageview', {'sessionControl': 'start'});
                // ga('send', 'event', 'BookView', 'WakeUp');
            }
            bookFullView._hideExtended = false;
        });

        // Handlers for next/prev emneord
        $('#previousEmneord').on('click', function() {
            self.emneordHistoryIndex--;
            self.viewEmneord(self.emneordHistory[self.emneordHistoryIndex]);
            ga('send', 'event', 'BookView', 'TapPreviousSubject', self.emneordHistory[self.emneordHistoryIndex]);
        });
        $('#nextEmneord').on('click', function() {
            self.emneordHistoryIndex++;
            self.viewEmneord(self.emneordHistory[self.emneordHistoryIndex]);
            ga('send', 'event', 'BookView', 'TapNextSubject', self.emneordHistory[self.emneordHistoryIndex]);
        });
    },
    routes: {
        'cat/:emneord': 'viewEmneord',
        'cat/:emneord/:bookId': 'viewBookById',
        '*other': 'defaultView'
    },
    defaultView: function() {
        startView.render();

        // this.viewEmneord('Forskning');
    },
    updateEmneordNavigation: function(emneord) {
        // Update current emneord in header
        $('#currentEmneord').text(emneord);
        // Only show previous emneord if there is one
        if (this.emneordHistoryIndex>0) {
            $('#previousEmneord').text('« '+this.emneordHistory[this.emneordHistoryIndex-1]);
            $('#previousEmneord').show();
        } else {
            $('#previousEmneord').hide();
        }
        // Only show next emneord if there is one
        if (this.emneordHistoryIndex<this.emneordHistory.length-1) {
            $('#nextEmneord').text(this.emneordHistory[this.emneordHistoryIndex+1]+' »');
            $('#nextEmneord').show();
        } else {
            $('#nextEmneord').hide();
        }
    },
    newCarousel: function(emneord, rotateTo) {
        var self = this;

        // fetch books
        $('.loader').toggle();
        books.fetch({
            data: {
                collection: 1,
                subject: emneord,
                limit: 150
            },
            success: function() {
                // Hide the loading icon
                $('.loader').toggle();
                // Store emneord in booksView
                books._emneord = emneord;
                // Render booksView
                booksView.render(rotateTo);

                self.updateEmneordNavigation(emneord);
            },
            error: function(){
                // Hide the loading icon
                $('.loader').toggle();

                console.log('error in fetch');
                errorMessageView.$el.show();
                errorMessageView.render('Noe gikk galt ved innhenting av data. Vennligst prøv igjen.');
            }
        });
    },
    spinCarousel: function(bookId) {
        carouSeal.rotateTo('b'+bookId);
        this.navigate('cat/' + books._emneord + '/' + bookId);
    },
    addEmneordToHistory: function(emneord) {
        // Don't add to history if coming from the previousEmneord/nextEmneord buttons
        if (emneord===this.emneordHistory[this.emneordHistoryIndex]) {
            return;
        }
        this.emneordHistory.push(emneord);
        this.emneordHistoryIndex++;
    },
    viewEmneord: function(emneord) {
        this.addEmneordToHistory(emneord);

        // TODO: Backbone-routeren har sikkert støtte for å endre tittel?
        document.title = 'Samling 42 - Emne: ' + emneord;
        ga('send', 'pageview', {title: document.title});

        var self = this;

        // Load carousel IF new emneord
        if (books._emneord !== emneord) {
        	this.newCarousel(emneord);

            // Remove the view of the current bookFullView
            bookFullView.model = null;
            bookFullView.render();

        	// When that's done:
        	$("#books").one('carouselDone', function() {
        	    // Render bookFullView
        	    bookFullView.model = books.at(0);
                bookFullView.currentEmneord = books._emneord;
        	    bookFullView.render();
        	    // Replace url
        	    self.navigate('cat/' + books._emneord + '/' + bookFullView.model.get('id'), {
        	        replace: true
        	    });
        	});
        } else {
        	// Else we just spin to the first book in the collection
        	this.spinCarousel(this.books.at(0).get('id'));
        }
    },
    viewBookById: function(emneord,bookId) {
        this.addEmneordToHistory(emneord);

        var self = this;
        // new carousel IF new emneord
        if (books._emneord !== emneord) {
            // Create the carousel and rotateTo position
            this.newCarousel(emneord, 'b'+bookId);
            // Spin when it's done
            $("#books").one('carouselDone', function() {
                // Render bookFullView
                bookFullView.model = books.findWhere({ id: Number(bookId) });
                bookFullView.render();
                bookFullView.currentEmneord = books._emneord;
            });
        } else {
            // Else just spin to position at once
            this.spinCarousel(bookId);
        }
    }
});

// ---------------------------------------- LISTEN TO KEY LEFT/RIGHT

$(document).keyup(function(e) {
	switch(e.which) {
		case 37: // left
			$('#books').trigger('keyLeft');
		break;

		case 39: // right
			$('#books').trigger('keyRight');
		break;
	}
	e.preventDefault();
});

// ---------------------------------------- CREATE COLLECTION

var books = new Books();

// ---------------------------------------- CREATE HELP MODAL

var Modal = Backbone.Modal.extend({
    template: '#helpModal',
    cancelEl: '.bbm-button'
});
$('#helpIcon').on('click', function() {
    var modalView = new Modal();
    $('#help').html(modalView.render().el);

    ga('send', 'event', 'BookView', 'TapHelpIcon');
});

// ---------------------------------------- CREATE VIEWS + ROUTER INSTANCE

var startView = new StartView();

var booksView = new BooksView({
    model: books
});

var bookFullView = new BookFullView();

var errorMessageView = new ErrorMessageView();

// Create an instance of the router
var router = new AppRouter({
    books: books
});

// Tell backbone to start listening
Backbone.history.start();

// Function used to send email to student
var sendEmail = function(studentid, bookId) {
    $.ajax({
        type: "POST",
        url: '*****',
        data: {
            studentid: studentid,
            bookId: bookId
        }
    });
};
// Listen to key input in order to register student cards
var ltid = '';
$(document).keypress(function(e) {
    ltid += String.fromCharCode(e.which);
    if(e.which == 13) {
        console.log(ltid);
        console.log(bookFullView.model.get('isbn'));
        // sendEmail(ltid, bookFullView.model.get('id'));
        ltid="";
        return false;
    }
});

})();
} catch (e) {
    Raven.captureException(e)
}

</script>

</body>
</html>
