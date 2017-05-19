
// @copyright
//   © 2016-2017 Jarosław Foksa

"use strict";

{
  let {html} = Xel.utils.element;
  let {isValidColorString} = Xel.utils.color;
  let theme = document.querySelector('link[href*=".theme.css"]').getAttribute("href");

  let loadingHtml = `
    <x-throbber type="spin" style="width:16px;margin: 0 auto;"></x-throbber>
  `;

  let shadowTemplate = html`
    <template>
      <link rel="stylesheet" href="${theme}">
      <link rel="stylesheet" href="node_modules/xel/stylesheets/x-input-suggestion.css" data-vulcanize>
      <main>
      <x-input id="xis-input">
        <x-icon id="xis-icon" name=""></x-icon>
        <x-label id="xis-label"></x-label>
        <ul id="xis-suggestion-list">
          ${loadingHtml}
        </ul>
      </x-input>
      </main>
    </template>
  `;

  // @events
  //   input
  //   change
  //   textinputmodestart
  //   textinputmodeend
  class XInputSuggestionElement extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({mode: "closed", delegatesFocus: true});
      this._shadowRoot.append(document.importNode(shadowTemplate.content, true));

      for (let element of this._shadowRoot.querySelectorAll("[id]")) {
        this["#" + element.id] = element;
      }

      this.addEventListener("keyup", (event) => this._onKeyUp(event));
      this.addEventListener("click", (event) => this._onClick(event));
      this.addEventListener("focusout", (event) => {
        this._hideSuggestion();
      });


      this._hideSuggestion();

      this.cache == null;

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

    _onKeyUp(event) {
      console.log('keyup', event);
      if (event.key === "Enter") {
        //todo:刷新曲线
      } else {
        if (this._getInput().trim() == '') {
          this.cache = null;
          return;
        }
        this._showSuggestion();
      }
    }

    _onClick(event) {
      if (this.cache == null) {
        return;
      }else {
        this._showSuggestion(this.cache);
      }
    }

    _getInput() {
      return this['#xis-input'].value;
    }

    
    _fetchSuggestionDataAndShow(cb) {

      let that = this;
      
      let url = this.getAttribute('url');
      url = url + '?q='+ this._getInput();

      console.log('_fetchSuggestionDataAndShow', url);

      if (typeof this.debug == 'undefined') {
        fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            that.cache = data.splice(0, 5);;
            that._showSuggestion(that.cache);
            
          });
      }else {
        //debug
        let responseJson = [
          {code:'000001', name:'平安银行'},
          {code:'000002', name:'平安银行'},
          {code:'000003', name:'平安银行'},
          {code:'000004', name:'平安银行'},
          {code:'000005', name:'平安银行'},
          {code:'000006', name:'平安银行'},
          {code:'000007', name:'平安银行'},
          {code:'000008', name:'平安银行'},
          {code:'000001', name:'平安银行'},
          {code:'000001', name:'平安银行'},
          {code:'000001', name:'平安银行'},
          {code:'000001', name:'平安银行'}
        ];
        
        that.cache = responseJson.splice(0, 5);;
        that._showSuggestion(that.cache);
      }
      
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

  customElements.define("x-input-suggestion", XInputSuggestionElement);
}
