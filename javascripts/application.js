(function() {

  this.App = Ember.Application.create();

  App.Form = Ember.View.extend({
    tagName: 'form',
    submit: function(e) {
      App.map.set('width', this.getPath('widthField.value'));
      App.map.set('height', this.getPath('heightField.value'));
      App.map.set('latitude', this.getPath('latitudeField.value'));
      App.map.set('longitude', this.getPath('longitudeField.value'));
      App.map.set('zoom', this.getPath('zoomField.value'));
      App.map.set('scale', this.getPath('scaleField.value'));
      Ember.View.views['map-area'].updateLocation();
      return e.preventDefault();
    },
    locationDidChange: (function() {
      this.setPath('latitudeField.value', App.map.get('latitude'));
      this.setPath('longitudeField.value', App.map.get('longitude'));
      return this.setPath('zoomField.value', App.map.get('zoom'));
    }).observes('App.map.latitude', 'App.map.longitude', 'App.map.zoom')
  });

  App.NumberField = Ember.TextField.extend({
    type: 'number',
    min: 1,
    max: 640,
    required: true,
    attributeBindings: ['min', 'max', 'required', 'step']
  });

  App.map = Ember.Object.create({
    width: 400,
    height: 400,
    scale: 1
  });

  App.MapView = Ember.View.extend({
    tagName: 'div',
    elementId: 'map-area',
    updateLocation: (function() {
      this.get('map').setCenter(new google.maps.LatLng(App.map.get('latitude'), App.map.get('longitude')));
      return this.get('map').setZoom(parseInt(App.map.get('zoom')));
    }),
    widthDidChange: (function() {
      this.$('#map').css('width', App.map.get('width'));
      if (this.get('map')) {
        return google.maps.event.trigger(this.get('map'), 'resize');
      }
    }).observes('App.map.width'),
    heightDidChange: (function() {
      this.$('#map').css('height', App.map.get('height'));
      if (this.get('map')) {
        return google.maps.event.trigger(this.get('map'), 'resize');
      }
    }).observes('App.map.height'),
    staticUrl: (function() {
      return "http://maps.googleapis.com/maps/api/staticmap?center=" + (App.map.get('latitude')) + "," + (App.map.get('longitude')) + "&zoom=" + (App.map.get('zoom')) + "&size=" + (App.map.get('width')) + "x" + (App.map.get('height')) + "&scale=" + (App.map.get('scale')) + "&maptype=roadmap&sensor=false";
    }).property('App.map.latitude', 'App.map.width', 'App.map.zoom', 'App.map.height', 'App.map.scale'),
    template: Ember.Handlebars.compile("<h2>Slippy Map</h2>\n<p>Use this to get the map how you want it to look.  Then scroll down for the static map.</p>\n<div id=\"map\">\n</div>\n<h2>Static Map</h2>\n<img class=\"static\" {{bindAttr src=\"staticUrl\"}}/>\n<dl>\n  <dt>Center</dt>\n  <dd>{{App.map.latitude}},{{App.map.longitude}}</dd>\n  <dt>Top left</dt>\n  <dd>{{App.map.maxlat}},{{App.map.minlon}}</dd>\n  <dt>Top right</dt>\n  <dd>{{App.map.maxlat}},{{App.map.maxlon}}</dd>\n  <dt>Bottom left</dt>\n  <dd>{{App.map.minlat}},{{App.map.minlon}}</dd>\n  <dt>Bottom right</dt>\n  <dd>{{App.map.minlat}},{{App.map.maxlon}}</dd>\n  <dt>URL</dt>\n  <dd><a {{bindAttr href=\"staticUrl\"}} target=\"_blank\">Google Static Map URL</a></dd>\n</dl>"),
    didInsertElement: function() {
      var map, overlay;
      this.widthDidChange();
      this.heightDidChange();
      map = new google.maps.Map(this.$('#map')[0], {
        center: new google.maps.LatLng(51.5, -0.13),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true
      });
      this.set('map', map);
      overlay = new google.maps.OverlayView();
      overlay.draw = function() {};
      overlay.setMap(map);
      return google.maps.event.addListener(map, 'idle', function() {
        var br, h, projection, tl, w;
        App.map.set('latitude', map.getBounds().getCenter().lat());
        App.map.set('longitude', map.getBounds().getCenter().lng());
        App.map.set('zoom', map.getZoom());
        w = parseInt(App.map.get('width'));
        h = parseInt(App.map.get('height'));
        projection = overlay.getProjection();
        tl = projection.fromContainerPixelToLatLng(new google.maps.Point(0, 0));
        br = projection.fromContainerPixelToLatLng(new google.maps.Point(w, h));
        App.map.set('maxlat', tl.lat());
        App.map.set('minlon', tl.lng());
        App.map.set('minlat', br.lat());
        return App.map.set('maxlon', br.lng());
      });
    }
  });

}).call(this);
