function installExtensions() {
  try {
    window.requireNode('fs');
  } catch (e) {
    console.warn(
      'ember-electron is unable to require node modules, possibly because nodeIntegration is not enabled.'
    );
    console.warn(
      'This prevents the installation of the Ember Inspector and Devtron extensions. Error:'
    );
    console.warn(e);
    return;
  }

  /**
   * Install Devtron in the current window.
   */
  function installDevtron() {
    try {
      let devtron = window.requireNode('devtron');

      if (devtron) {
        devtron.install();
      }
    } catch (e) {
      console.error('Error installing devtron', e);
    }
  }

  /**
   * Install Ember-Inspector in the current window.
   */
  function installEmberInspector() {
    const { default: installExtension, EMBER_INSPECTOR } = window.requireNode('electron-devtools-installer');
    let { app } = window.requireNode('electron').remote;

    app.whenReady().then(() => {
      installExtension(EMBER_INSPECTOR)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    });
  }

  installDevtron();
  installEmberInspector();
}

document.addEventListener('DOMContentLoaded', installExtensions);
