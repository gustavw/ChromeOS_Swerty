/*
Copyright 2017 RNLD METRICS AB All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var AltGr = { PLAIN: "plain", ALTERNATE: "alternate" };
var Shift = { PLAIN: "plain", SHIFTED: "shifted" };

var contextID = -1;
var altGrState = AltGr.PLAIN;
var shiftState = Shift.PLAIN;

var lut = {
"BracketLeft": { "plain": {"plain": "å", "shifted": "Å"}, "alternate": {"plain": "[", "shifted":"{"}, "code": "#N/A"},
"Quote": { "plain": {"plain": "ä", "shifted": "Ä"}, "alternate": {"plain": "'", "shifted":"\""}, "code": "#N/A"},
"Semicolon": { "plain": {"plain": "ö", "shifted": "Ö"}, "alternate": {"plain": ";", "shifted":":"}, "code": "#N/A"},
};
    

chrome.input.ime.onFocus.addListener(function(context) {
  contextID = context.contextID;
});

function updateAltGrState(keyData) {
  altGrState = (keyData.code == "AltRight") ?
    ((keyData.type == "keydown") ?
    AltGr.ALTERNATE : AltGr.PLAIN) : altGrState;
}

function updateShiftState(keyData) {
  shiftState = ((keyData.shiftKey && !(keyData.capsLock)) ||
    (!(keyData.shiftKey) && keyData.capsLock)) ?
    Shift.SHIFTED : Shift.PLAIN;
}


chrome.input.ime.onKeyEvent.addListener(
    function(engineID, keyData) {
      var handled = false;
      
      updateAltGrState(keyData);
      updateShiftState(keyData);
                
      if (lut[keyData.code]) {
          var remappedKeyData = keyData;
          remappedKeyData.key = lut[keyData.code][altGrState][shiftState];
          remappedKeyData.code = lut[keyData.code].code;
        
        if (chrome.input.ime.sendKeyEvents !== undefined && keyData.type == "keydown") {
          chrome.input.ime.commitText(
              {"contextID": contextID, "text": remappedKeyData.key}
          );
          handled = true;
        }

      }
      
      return handled;
});
