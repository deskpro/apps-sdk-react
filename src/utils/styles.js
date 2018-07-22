let stylesLoaded = false;

export function linkStyles() {
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
