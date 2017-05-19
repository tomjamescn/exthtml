
// @copyright
//   © 2016-2017 Jarosław Foksa

"use strict";

{
  let {html} = Xel.utils.element;
  let {sleep} = Xel.utils.time;
  let theme = document.querySelector('link[href*=".theme.css"]').getAttribute("href");

  let shadowTemplate = html`
    <template>
      <link rel="stylesheet" href="${theme}">
      <link rel="stylesheet" href="node_modules/xel/stylesheets/xel-myapp.css" data-vulcanize>

      <main id="main">
        <x-button id="show-sidebar-button" icon="settings" skin="textured">
          <x-icon name="settings"></x-icon>
        </x-button>

        <sidebar id="sidebar">


          <h1>设置</h1>

          <x-button id="hide-sidebar-button" skin="textured">
            <x-icon name="chevron-left"></x-icon>
          </x-button>

          <hr/>

          <x-tabs>
            <x-tab selected for="navMain">
              <x-label>主图</x-label>
            </x-tab>

            <x-tab for="navAnother">
              <x-label>附图</x-label>
            </x-tab>

            <x-tab for="navOther">
              <x-label>其他</x-label>
            </x-tab>

          </x-tabs>

          <nav id="navMain">

            <section>

              <x-input-suggestion id="input-share-search" 
                  url="/build/dist/data/x-input-suggestion-data.json" 
                  label="股票编码" 
                  icon="search" 
                  >
              </x-input-suggestion>

              <div class="space"></div>

              <h4>时间区间</h4>
              

              <x-input id="input-start-time">
                <x-icon name="date-range"></x-icon>
                <x-label>开始时间</x-label>
              </x-input>

              <x-input id="inputEndTime">
                <x-icon name="date-range"></x-icon>
                <x-label>结束时间</x-label>
              </x-input>

              <div class="space"></div>

              <x-radios>
                <x-box>
                  <x-radio id="kTypeDay"></x-radio>
                  <x-label for="kTypeDay" id="label-kTypeDay">日线</x-label>
                </x-box>
                <x-box>
                  <x-radio id="kTypeWeek" toggled></x-radio>
                  <x-label for="kTypeWeek" id="label-kTypeWeek">周线</x-label>
                </x-box>
                <x-box>
                  <x-radio id="kTypeMonth"></x-radio>
                  <x-label for="kTypeMonth" id="label-kTypeMonth">月线</x-label>
                </x-box>
                <x-box>
                  <x-radio id="kTypeCustom"></x-radio>
                  <x-label for="kTypeCustom" id="label-kTypeCustom">自定义</x-label>
                </x-box>
              </x-radios>

              <div class="space"></div>

              <x-box>
                <x-switch id="switch-1"></x-switch>
                <x-label for="switch-1" id="label-1">显示均线</x-label>
              </x-box>

            </section>

            

          </nav>


          <nav id="navAnother">

            <section>

              <x-box>
                <x-switch id="switch-macd"></x-switch>
                <x-label for="switch-macd" id="label-macd">显示MACD</x-label>
              </x-box>

              <div class="space"></div>

              <x-box>
                <x-switch id="switch-rsi"></x-switch>
                <x-label for="switch-rsi" id="label-rsi">显示RSI</x-label>
              </x-box>


            </section>

          </nav>

          <nav id="navOther">

            <section id="theme-section">
              <h3>Theme</h3>

              <x-select id="theme-select">
                <x-menu>
                  <x-menuitem value="/build/dist/stylesheets/material.theme.css" selected="true">
                    <x-label>Material</x-label>
                  </x-menuitem>

                  <x-menuitem value="/build/dist/stylesheets/macos.theme.css" selected="true">
                    <x-label>macOS</x-label>
                  </x-menuitem>
                </x-menu>
              </x-select>
            </section>

          </nav>

        </sidebar>
        
        <div id="views"></div>
      </main>
    </template>
  `;

  class XelAppElement extends HTMLElement {

    get navIdList() {
      let idList = [];
      this._shadowRoot.querySelectorAll("sidebar x-tab").forEach((ele) => {
        idList[idList.length] = ele.getAttribute('for');
      });
      return idList;
    }

    constructor() {
      super();

      this._shadowRoot = this.attachShadow({mode: "closed"});
      this._shadowRoot.append(document.importNode(shadowTemplate.content, true));

      for (let element of this._shadowRoot.querySelectorAll("[id]")) {
        this["#" + element.id] = element;
      }

      window.addEventListener("load", () => this._onWindowLoad());
      window.addEventListener("popstate", (event) => this._onPopState(event));
      window.addEventListener("beforeunload", (event) => this._onWindowUnload(event));
      this["#theme-select"].addEventListener("change", () => this._onThemeSelectChange());
      this["#hide-sidebar-button"].addEventListener("click", (event) => this._onHideNavButtonClick(event));
      this["#show-sidebar-button"].addEventListener("click", (event) => this._onShowNavButtonClick(event));
      this._shadowRoot.addEventListener("click", (event) => this._onShadowRootClick(event));
      
      this._hideSidebar();

      var that = this;
      this._shadowRoot.querySelectorAll("sidebar x-tab").forEach((ele) => {
        ele.addEventListener("click", function (event) {
          let id = ele.getAttribute('for');
          that._showNav(id);
        });
      });

      this._showNav('navMain');

      //时间控件
      this['#input-start-time'].addEventListener('click', (event) => {

        let dialogDatePicker = document.querySelector("#dialog-date-picker");
        let agreeButton = document.querySelector("#dialog-date-picker #agree-button");
        let disagreeButton = document.querySelector("#dialog-date-picker #disagree-button");
        let datePicker = document.querySelector("#date-picker");
        let label = that['#input-start-time'].querySelector('x-label').innerHTML;
        let curDate = that['#input-start-time'].value;

        window.debug2 = agreeButton;

        agreeButton.addEventListener("click", () => {
          // console.log('click1');
          let date = datePicker.value;
          if (date != false || date != '') {
            this['#input-start-time'].value = date;
          }

          dialogDatePicker.opened = false;

        });

        disagreeButton.addEventListener("click", () => {
          // console.log('click2');
          dialogDatePicker.opened = false;
        });

        datePicker.label = label;
        if (curDate != '') {
          datePicker.value = curDate;
        }
        
        dialogDatePicker.opened = true;

        
      });

    }

    connectedCallback() {
      this._update();

      history.scrollRestoration = "manual";

      if (history.state === null) {
        history.replaceState(null, null, window.location.href);
      }

      let theme = document.querySelector('link[href*=".theme.css"]').getAttribute('href');

      for (let item of this["#theme-select"].querySelectorAll("x-menuitem")) {
        item.setAttribute("selected", (item.getAttribute("value") === theme) ? "true" : "false");
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _onThemeSelectChange() {
      sessionStorage.setItem("theme", this["#theme-select"].value);
      location.reload();
    }

    _onWindowLoad() {
      let selectedView = this["#views"].querySelector(".view");
      console.log(selectedView);
    }

    _onWindowUnload(event) {
      let selectedView = this["#views"].querySelector(".view[selected]");
      sessionStorage.setItem("selectedViewScrollTop", selectedView.scrollTop);
    }

    _onPopState(event) {
      this._update()
    }

    _onShadowRootClick(event) {
      let {ctrlKey, shiftKey, metaKey, target} = event;

      if (ctrlKey === false && shiftKey === false && metaKey === false) {
        let anchor = target.closest("a");

        if (anchor) {
          let url = new URL(anchor.href);

          if (location.origin === url.origin) {
            event.preventDefault();

            if (location.pathname !== url.pathname) {
              history.pushState(null, null, anchor.href);
              this._update();
            }
          }
        }
      }
    }

    _onHideNavButtonClick(event) {
      if (event.button === 0) {
        this._hideSidebar();
      }
    }

    _onShowNavButtonClick(event) {
      if (event.button === 0) {
        this._showSidebar();
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _update() {
      return new Promise( async (resolve) => {

        // Update displayed view to match current location
        {
          let selectedView = this["#views"].querySelector(".view[selected]");

          if (!selectedView || selectedView.dataset.pathname !== location.pathname) {
            let view = this["#views"].querySelector(`[data-pathname="${location.pathname}"]`);

            // If the view does not exist, try to create it
            if (!view) {
              let $0 = (location.pathname === "/app.html") ? "/about" : location.pathname;
              // let url = `/build/dist/views` + $0 + `.html`;
              let url = `/d3_demo_1.html`;
              // let url = `/d3_stock_chart.html`;
              
              let result = await fetch(url);
              let viewHTML = await result.text();
              // console.log(viewHTML);

              view = html`${viewHTML}`;
              // console.log(view);
              view.setAttribute("data-pathname", location.pathname);
              this["#views"].append(view);
            }
            

            // Toggle view
            {
              let view = this["#views"].querySelector(`[data-pathname="${location.pathname}"]`);
              let otherView = this["#views"].querySelector(`.view[selected]`);

              if (otherView) {
                if (otherView === view) {
                  return;
                }
                else {
                  otherView.removeAttribute("selected");
                }
              }

              view.setAttribute("selected", "");
            }
            

            // Hide theme-specific sections that don't match the current theme
            {
              let theme = document.querySelector('link[href*=".theme.css"]').getAttribute('href');
              let themeName = theme.substring(theme.lastIndexOf("/") + 1, theme.length - 10);

              for (let section of view.querySelectorAll("section")) {
                if (section.hasAttribute("data-themes")) {
                  if (section.getAttribute("data-themes").includes(themeName) === false) {
                    section.hidden = true;
                  }
                }
              }
            }

            // Remove offscreen views
            {
              for (let view of [...this["#views"].children]) {
                if (view.hasAttribute("animating") === false && view.hasAttribute("selected") === false) {
                  view.remove();
                }
              }
            }
          }
        }

        resolve();
      });
    }

    _showSidebar() {
      return new Promise(async (resolve) => {
        this["#sidebar"].hidden = false;

        let {width, height, marginLeft} = getComputedStyle(this["#sidebar"]);
        let fromMarginLeft = (marginLeft === "0px" && width !== "auto" ? `-${width}` : marginLeft);
        let toMarginLeft = "0px";

        let animation = this["#sidebar"].animate(
          {
            marginLeft: [fromMarginLeft, toMarginLeft]
          },
          {
            duration: 250,
            easing: "cubic-bezier(0.4, 0.0, 0.2, 1)"
          }
        );

        this["#sidebar"].style.marginLeft = "0";
        this._currentAnimation = animation;
      });
    }

    _hideSidebar() {
      return new Promise(async (resolve) => {
        this["#sidebar"].hidden = false;

        let {width, height, marginLeft} = getComputedStyle(this["#sidebar"]);
        let fromMarginLeft = (marginLeft === "0px" && width !== "auto" ? "0px" : marginLeft);
        let toMarginLeft = `-${width}`;

        let animation = this["#sidebar"].animate(
          {
            marginLeft: [fromMarginLeft, toMarginLeft]
          },
          {
            duration: 250,
            easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
          }
        );

        this["#sidebar"].style.marginLeft = toMarginLeft;
        this._currentAnimation = animation;

        await animation.finished;

        if (this._currentAnimation === animation) {
          this["#sidebar"].hidden = true;
        }
      });
    }

    _showNav(id) {
      this.navIdList.map((id) => {this[`#${id}`].hidden = true;});
      this[`#${id}`].hidden = false;
    }
  }

  customElements.define("xel-myapp", XelAppElement);
}
