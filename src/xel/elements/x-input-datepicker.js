
// @copyright
//   © 2016-2017 Jarosław Foksa

"use strict";

{
  let {html} = Xel.utils.element;
  let {isValidColorString} = Xel.utils.color;
  
  let shadowTemplate = html`
    <template>
      <link href="bower_components/HTML5-Reset/assets/css/reset.css" rel="import">
      <link href="bower_components/vaadin-core-elements/vaadin-core-elements.html" rel="import">
      <link rel="stylesheet" href="node_modules/xel/stylesheets/x-input-datepicker.css" data-vulcanize>
      <main>
      <vaadin-date-picker label=""></vaadin-date-picker>
      </main>
    </template>
  `;

  // @events
  //   input
  //   change
  //   textinputmodestart
  //   textinputmodeend
  class XInputDatePickerElement extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({mode: "closed", delegatesFocus: true});
      this._shadowRoot.append(document.importNode(shadowTemplate.content, true));

      for (let element of this._shadowRoot.querySelectorAll("[id]")) {
        this["#" + element.id] = element;
      }

      this.addEventListener("click", (event) => this._onClick(event));
      
    }

    connectedCallback() {
      
      this._update();
    }

    attributeChangedCallback(name) {
      console.log('attributeChangedCallback', name, this.getAttribute(name));
      let value = this.getAttribute(name);

      if (name == 'label') {
        this['#xis-label'].innerHTML = value;
      } else if (name == 'icon') {
        this['#xis-icon'].name = value;
      }
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static get observedAttributes() {
      return ["url", 'label', 'icon', 'debug'];
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    

    _onClick(event) {
      
    }

    _getInput() {
      return this['#xis-input'].value;
    }

    
    

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _update() {
    }




    _showSuggestion(givenData) {

      let top = this['#xis-input'].offsetHeight;
      this['#xis-suggestion-list'].style.top = `${top}px`;

      let width = this.getBoundingClientRect().width;
      this['#xis-suggestion-list'].style.width = `${width}px`;


      if(givenData == undefined) {
        this['#xis-suggestion-list'].innerHTML = loadingHtml
        this['#xis-suggestion-list'].hidden = false;
        this._fetchSuggestionDataAndShow();

      }else {
        if (this.cache == null || this.cache.length <= 0) {
          return;
        }

        
        let innerHTML = '';
        this.cache.map((data) => {
          innerHTML += `<li style="width:${width}px;" code="${data.code}">${data.code} ${data.name}</li>`;
        });

        this['#xis-suggestion-list'].innerHTML = innerHTML;

        this['#xis-suggestion-list'].querySelectorAll('li').forEach((ele) => {

          ele.addEventListener('click', (event) => {
            //停止冒泡
            event.stopPropagation();
            let code = ele.getAttribute('code');
            this['#xis-input'].value = code;
            this._hideSuggestion();
            // console.log('clicked me!', ele);
            // console.log('code', code);
          });
        });

        this['#xis-suggestion-list'].hidden = false;
      }
      
    }

    _hideSuggestion() {
      this['#xis-suggestion-list'].hidden = true;
    }

    
  }

  customElements.define("x-input-datepicker", XInputDatePickerElement);
}
