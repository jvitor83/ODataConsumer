// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.


export const environment = {
  production: false,
  authentication: {
    authority: 'http://',
    client_id: '2380',
    client_secret: 'secret',
    redirect_uri: 'http://localhost:5555/callback.html',
    post_logout_redirect_uri: 'http://localhost:5555',
    response_type: 'code id_token token',
    scope: 'openid profile pjmt_profile email roles offline_access permissao_2380',

    silent_redirect_uri: 'http://localhost:5555/silentrefresh.html',
    automaticSilentRenew: true,
    //silentRequestTimeout:10000,

    filterProtocolClaims: true,
    loadUserInfo: true,

  },
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  }
};
