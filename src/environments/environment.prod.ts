





export const environment = {
  production: true,
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

