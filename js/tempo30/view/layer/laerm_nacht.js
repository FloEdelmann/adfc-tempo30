define('tempo30/view/layer/laerm_nacht', [
    'leaflet',
    'tempo30/view/layer/t30mapurl',
], function (L, mapurl) {

    'use strict';

    //var layer = L.tileLayer.wms("http://geodienste.hamburg.de/HH_WMS_Strassenverkehr?zufall=0.21", {
    var layer = L.tileLayer.wms(mapurl, {
	layers: 'Laerm_2012_Nacht',
	format: 'image/png',
	crs: L.CRS.EPS4326,
	transparent: true,
	attribution: "Laermkarten Hamburg © Datenlizenz Deutschland Namensnennung 2.0"
    });
    layer.options.crs = L.CRS.EPSG4326;
    return layer;
});