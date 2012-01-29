@App = Ember.Application.create()

App.Form = Ember.View.extend
  tagName: 'form'
  submit: (e) ->
    App.map.set('width', @getPath('widthField.value'))
    App.map.set('height', @getPath('heightField.value'))
    App.map.set('latitude', @getPath('latitudeField.value'))
    App.map.set('longitude', @getPath('longitudeField.value'))
    App.map.set('zoom', @getPath('zoomField.value'))
    App.map.set('scale', @getPath('scaleField.value'))
    Ember.View.views['map-area'].updateLocation()
    e.preventDefault()
  locationDidChange: ( ->
    @setPath('latitudeField.value', App.map.get('latitude') )
    @setPath('longitudeField.value', App.map.get('longitude') )
    @setPath('zoomField.value', App.map.get('zoom') )
  ).observes('App.map.latitude', 'App.map.longitude', 'App.map.zoom')

App.NumberField = Ember.TextField.extend
  type: 'number'
  min: 1
  max: 640
  required: true
  attributeBindings: ['min','max','required','step']

App.map = Ember.Object.create
  width: 400
  height: 400
  scale: 1

App.MapView = Ember.View.extend
  tagName: 'div'
  elementId: 'map-area'
  updateLocation: ( ->
    @get('map').setCenter( new google.maps.LatLng( App.map.get('latitude'), App.map.get('longitude') ) )
    @get('map').setZoom( parseInt App.map.get('zoom') )
  )
  widthDidChange: ( ->
    @$('#map').css('width', App.map.get('width'))
    google.maps.event.trigger(@get('map'), 'resize') if @get('map')
  ).observes('App.map.width')
  heightDidChange: ( ->
    @$('#map').css('height', App.map.get('height'))
    google.maps.event.trigger(@get('map'), 'resize') if @get('map')
  ).observes('App.map.height')
  staticUrl: ( ->
    "http://maps.googleapis.com/maps/api/staticmap?center=#{App.map.get('latitude')},#{App.map.get('longitude')}&zoom=#{App.map.get('zoom')}&size=#{App.map.get('width')}x#{App.map.get('height')}&scale=#{App.map.get('scale')}&maptype=roadmap&sensor=false"
  ).property('App.map.latitude','App.map.width','App.map.zoom','App.map.height', 'App.map.scale')
  template: Ember.Handlebars.compile """
  <h2>Slippy Map</h2>
  <p>Use this to get the map how you want it to look.  Then scroll down for the static map.</p>
  <div id="map">
  </div>
  <h2>Static Map</h2>
  <img class="static" {{bindAttr src="staticUrl"}}/>
  <dl>
    <dt>Center</dt>
    <dd>{{App.map.latitude}},{{App.map.longitude}}</dd>
    <dt>Top left</dt>
    <dd>{{App.map.maxlat}},{{App.map.minlon}}</dd>
    <dt>Top right</dt>
    <dd>{{App.map.maxlat}},{{App.map.maxlon}}</dd>
    <dt>Bottom left</dt>
    <dd>{{App.map.minlat}},{{App.map.minlon}}</dd>
    <dt>Bottom right</dt>
    <dd>{{App.map.minlat}},{{App.map.maxlon}}</dd>
    <dt>URL</dt>
    <dd><a {{bindAttr href="staticUrl"}} target="_blank">Google Static Map URL</a></dd>
  </dl>
  """
  didInsertElement: ->
    @widthDidChange()
    @heightDidChange()
    map = new google.maps.Map @$('#map')[0],
      center: new google.maps.LatLng(51.5,-0.13)
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
      disableDefaultUI: true
      zoomControl: true
    @set('map',map)

    overlay = new google.maps.OverlayView()
    overlay.draw = ->
    overlay.setMap(map)
    google.maps.event.addListener map, 'idle', ->
      App.map.set('latitude', map.getBounds().getCenter().lat())
      App.map.set('longitude', map.getBounds().getCenter().lng())
      App.map.set('zoom', map.getZoom() )

      w = parseInt(App.map.get('width'))
      h = parseInt(App.map.get('height'))
      projection = overlay.getProjection()

      tl = projection.fromContainerPixelToLatLng(new google.maps.Point(0,0))
      br = projection.fromContainerPixelToLatLng(new google.maps.Point(w,h))
      App.map.set('maxlat', tl.lat())
      App.map.set('minlon', tl.lng())
      App.map.set('minlat', br.lat())
      App.map.set('maxlon', br.lng())
