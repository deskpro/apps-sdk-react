
import DeskproSDK from '../components/DeskproSDK';
import configureStore from '../store/configureStore';

/**
 * A `connector` style factory that creates a function which wraps the DeskproSDK component around another component
 *
 * @param {AppClient} appClient @see https://deskpro.github.io/apps-sdk-core/reference/AppClient.html
 * @returns {function(function): XML}
 */
export function createAppContainer(appClient)
{
  const store = configureStore(appClient);
  return app => <DeskproSDK dpapp={appClient} store={store}>{app}</DeskproSDK>;
}
