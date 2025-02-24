define('tempo30/view/str_wahl_dialog', [
    'jquery',
    'bootstrap',
    'bootstrap-dialog',
    'gettext!tempo30', 
    'tempo30/view/positionmap',
    'tempo30/model/geoUtil',
    'tempo30/model/overpassUtil',
    'text!tempo30/overpass/t50_strassen_in_bbox.overpassql',
], function ($, bootstrap, BootstrapDialog, gt, createMap, geoUtil, opUtil, ovT50Query) {

    'use strict';

    function getDialog(data, cbBack, cbNext, cbNotFound) {
        var buttons=[
            {
                id: 'back-btn',
                label: gt('zurück'),
                title: gt('zu Schritt 1'),
                action: function (dialogRef) {
                    dialogRef.close();
                    cbBack(data);
                }
            },
            {
                id: 'next-btn',
                label: gt('weiter'),
                title: gt('Zeigt den Antragstext in einem neuen Fenster'),
                cssClass: 'btn-primary',
                action: function (dialogRef) {
                    data.antrag = [];
                    dialogRef.getModalBody().find('input:checked').each(
                        function (idx,obj) { 
                            data.antrag.push($(obj).prop('value'));
                        });
                    if (data.antrag.length>0) {
                        dialogRef.close();
                        cbNext(data);
                    } else {
                        dialogRef.getModalBody().find('#strwahlerr').text(gt('Fehler: Keine Straße ausgewählt'));
                    }
                }
            }];

        var bbox=geoUtil.bboxDist(data.lat, data.lon, 100);
        var dialog = new BootstrapDialog({
            'title': gt('Tempo 30 beantragen, Schritt 3: Für welche Straßen wollen Sie Tempo 30 beantragen?'),
            'message': gt('Bitte warten, Straßen in der Nähe werden gesucht...'),
            'buttons': buttons,
            onshown: function(dialogRef){
            },
            onhide: function(dialogRef){
            },
        });
        dialog.realize();
        dialog.getButton('next-btn').disable();
        dialog.getButton('next-btn').spin();
        opUtil.getResult(opUtil.replaceBBox(ovT50Query, bbox)).done(function (r) {
            console.log(r.elements);
            if (r.elements.length === 0) {
                dialog.close();
                cbNotFound(data);
                // FIXME siehe Issue: #11
                // es gibt keine Straßen in ihrer Nähe
            } else {
                var msg=gt('Sie können nur für Straßen Tempo 30 beantragen, die direkt an Ihrer Wohnung liegen (auch wenn Sie durch eine weiter entfernte  Straße evtl. Einschränkungen (z.B. Lärm) haben). Bitte die Auswahl ernst nehmen, da wir wollen, dass die Anträge die Aussicht auf Erfolg haben schnell geprüft werden.\n Für welche Straßen wollen Sie Tempo 30 beantragen?');
                msg=msg+ '<div id="strwahlerr"></div>';
                var str={};
                $.each(r.elements, function (idx, obj) {
                    if (obj.type === 'way') {
                        var name = obj.tags.name || obj.tags.ref || 'unbenannte Straße';
                        str[name] =1;
                    }
                });
                var checked='';
                if (Object.keys(str).length ==1) {
                    checked=' checked="1"';
                }
                $.each(str,function (name) {
                    msg=msg+'<div class="checkbox"> <label><input type="checkbox" value="'+name+'"'+checked+'>'+name+'</label></div>';
                    checked="";
                });
                dialog.setMessage(msg);
                dialog.getButton('next-btn').stopSpin();
                dialog.getButton('next-btn').enable();
            }

        });
        return dialog;
    }
    return getDialog;
});