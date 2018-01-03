import { UIConstants, UIEvents } from '@deskpro/apps-sdk-core';

let stylesLoaded = false;

function linkStyles() {
  if (!stylesLoaded) {
    const css = `

    html.deskpro-sidebar {
        margin: 0;
        padding: 0;
    }

    .deskpro-sidebar body {
        margin: 0;
        padding: 0;
    }`;

    const style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(style);
    stylesLoaded = true;
  }
}

/**
 * Returns an html element used as the apps toolbar
 *
 * @method
 * @param {App} app
 * @param {string} title The app title
 * @param {string} icon Path to the app icon
 * @returns {HTMLElement}
 */
export function createToolbar(app, title, icon) {
  linkStyles();

  const toolbar = document.createElement('div');
  toolbar.setAttribute('id', 'deskpro-toolbar');
  toolbar.setAttribute('class', 'dp-column-drawer dp-column-drawer--with-controls');
  toolbar.innerHTML = `
    <h1 class="dp-heading">
      <div style="position: relative; margin-top: 6px; margin-right: 6px;">
        <div style="position: absolute; top: -13px; right: -10px">
          <div
            id="deskpro-toolbar__badge"
            style="display: none;"
            class="dp-badge dp-badge--danger dp-bg--danger dp-circle-badge"
          >0</div>
        </div>
        <img src="${icon}" style="width: 16px; height: 16px; border: 0;" />
      </div>
      <div class="deskpro-toolbar__title" style="max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${title}
      </div>
      <i
        id="deskpro-toolbar__collapse"
        class="fa fa-caret-up dp-icon dp-icon--s dp-column-drawer__arrow"
      ></i>
      <span class="dp-heading__controls">
        <i
          id="deskpro-toolbar__refresh"
          class="fa fa-refresh dp-icon dp-icon--s"
        ></i>
      </span>
     </h1>
  `;

  const badge = toolbar.querySelector('#deskpro-toolbar__badge');
  app.on(UIEvents.EVENT_BADGE_VISIBILITYCHANGED, () => {
    badge.style.display = app.ui.badge === UIConstants.VISIBILITY_VISIBLE ? 'inline-flex' : 'none';
  });
  app.on(UIEvents.EVENT_BADGE_COUNTCHANGED, () => {
    badge.innerText = String(app.ui.badgeCount);
  });

  const collapse = toolbar.querySelector('#deskpro-toolbar__collapse');
  app.on(UIEvents.EVENT_UI_DISPLAYCHANGED, () => {
    if (app.ui.isExpanded()) {
      collapse.classList.add('fa-caret-up');
      collapse.classList.remove('fa-caret-down');
    } else {
      collapse.classList.remove('fa-caret-up');
      collapse.classList.add('fa-caret-down');
    }
  });
  collapse.addEventListener('click', () => {
    if (app.ui.isExpanded()) {
      app.ui.collapse();
    } else {
      app.ui.expand();
    }
  });

  const refresh = toolbar.querySelector('#deskpro-toolbar__refresh');
  refresh.addEventListener('click', app.refresh);

  return toolbar;
}
