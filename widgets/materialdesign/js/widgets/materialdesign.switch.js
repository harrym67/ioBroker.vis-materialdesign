/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.switch = {
    initialize: function (data) {
        try {

            let labelClickActive = '';
            if (data.labelClickActive === 'false' || data.labelClickActive === false) {
                labelClickActive = 'pointer-events:none;'
            }

            let labelPosition = '';
            if (data.labelPosition === 'left') {
                labelPosition = 'mdc-form-field--align-end'
            }

            let element = `
            <div class="mdc-switch" style="margin-left: 10px; margin-right: 10px;">
                <div class="mdc-switch__track"></div>
                <div class="mdc-switch__thumb-underlay">
                    <div class="mdc-switch__thumb">
                        <input class="mdc-switch__native-control" id="materialdesign-checkbox-switch-${data.wid}" type="checkbox" data-oid="${data.oid}" role="switch">
                    </div>
                </div>
            </div>
            <label id="label" for="materialdesign-checkbox-switch-${data.wid}" style="width: 100%; cursor: pointer; ${labelClickActive}">Checkbox 1</label>
            `

            return { myswitch: element, style: labelPosition };

        } catch (ex) {
            console.error(`[Switch - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }

    },
    handle: function (el, data) {
        try {
            var $this = $(el);
            var oid = $this.data('oid');

            if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                // Append lock icon if activated
                $this.append(`<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                        style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`);

                $this.attr('isLocked', true);
                $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            let switchElement = $this.find('.mdc-switch').get(0);

            const mdcFormField = new mdc.formField.MDCFormField($this.get(0));
            const mdcSwitch = new mdc.switchControl.MDCSwitch(switchElement);
            mdcFormField.input = mdcSwitch;

            mdcSwitch.disabled = myMdwHelper.getBooleanFromData(data.readOnly, false);

            switchElement.style.setProperty("--materialdesign-color-switch-on", myMdwHelper.getValueFromData(data.colorSwitchTrue, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-off", myMdwHelper.getValueFromData(data.colorSwitchThumb, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-track", myMdwHelper.getValueFromData(data.colorSwitchTrack, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-off-hover", myMdwHelper.getValueFromData(data.colorSwitchHover, ''));

            setSwitchState();

            if (!vis.editMode) {
                $this.find('.mdc-switch').click(function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === undefined) {
                        if (data.toggleType === 'boolean') {
                            myMdwHelper.setValue(data.oid, mdcSwitch.checked);
                        } else {
                            if (!mdcSwitch.checked === true) {
                                myMdwHelper.setValue(data.oid, data.valueOff);
                            } else {
                                myMdwHelper.setValue(data.oid, data.valueOn);
                            }
                        }
                        setSwitchState();

                    } else {
                        mdcSwitch.checked = !mdcSwitch.checked;
                        unlockSwitch();
                    }
                });
            }

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                setSwitchState();
            });

            function setSwitchState() {
                var val = vis.states.attr(oid + '.val');

                let buttonState = false;

                if (data.toggleType === 'boolean') {
                    buttonState = val;
                } else {
                    if (val === parseInt(data.valueOn) || val === data.valueOn) {
                        buttonState = true;
                    } else if (val !== parseInt(data.valueOn) && val !== data.valueOn && val !== parseInt(data.valueOff) && val !== data.valueOff && data.stateIfNotTrueValue === 'on') {
                        buttonState = true;
                    }
                }

                mdcSwitch.checked = buttonState;

                let label = $this.find('label[id="label"]');
                if (buttonState) {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorTrue, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorFalse, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelFalse, ''));
                }
            }

            function unlockSwitch() {
                $this.find('.materialdesign-lock-icon').fadeOut();
                $this.attr('isLocked', false);
                $this.css('filter', 'grayscale(0%)');

                setTimeout(function () {
                    $this.attr('isLocked', true);
                    $this.find('.materialdesign-lock-icon').show();
                    $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }
        } catch (ex) {
            console.error(`[Switch - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
}