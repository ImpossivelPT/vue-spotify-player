<template>
    <div class="player">
        <div class="App">
        <header class="App-header">
            <img src="@/assets/logo.svg" class="App-logo" alt="logo" />

            <!-- Got no token -> Ask to login -->
            <template v-if="!token">
                <a
                  class="btn btn--loginApp-link"
                  :href="loginUrl"
                >
                  Login to Spotify
                </a>
            </template>

            <!-- Got token and there is data to show -> Show Player -->
            <template v-else-if="token && !no_data">
                <Player
                    :item="item"
                    :is_playing="is_playing"
                    :progress_ms="progress_ms"
                />
            </template>

            <!-- Got token but there is nothing to show -->
            <template v-else-if="no_data">
                <p>
                  You need to be playing a song on Spotify, for something to appear here.
                </p>
            </template>
        </header>
      </div>
    </div>
</template>

<script>
import Player from './Player.vue'
export default {
    name: 'SpotifyComp',
    mounted: function () {
        // try to get token from url
        this.setTokenFromHash()

        // set interval for polling every 5 seconds
        this.interval = setInterval(() => this.tick(), 5000);
    },
    beforeDestroy: function (){
        // clear the interval to save resources
        clearInterval(this.interval);
    },
    data: function() {
        return {
            interval:null, // used for tick
            token: null,
            item: {
                album: {
                    images: [{ url: "" }]
                },
                name: "",
                artists: [{ name: "" }],
                duration_ms: 0
            },
            is_playing: "Paused",
            progress_ms: 0,
            no_data: false,
        }
    },
    computed: {
        authEndpoint: function() {
            return process.env.VUE_APP_AUTHENDPOINT;
        },
        clientId: function() {
            return process.env.VUE_APP_CLIENTID;
        },
        redirectUri: function() {
            return process.env.VUE_APP_REDIRECTURI;
        },
        scopes: function() {
            let scopes = process.env.VUE_APP_SCOPES? process.env.VUE_APP_SCOPES : '';
            return scopes.replace(",","%20")
        },
        loginUrl: function () {
            return `${this.authEndpoint}?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scopes}&response_type=token&show_dialog=true`
        }
    },
    methods: {
        tick: function (){
            if(this.token) {
                this.getCurrentlyPlaying(this.token);
            }
        },
        getCurrentlyPlaying: function (token) {
            this.axios.get("https://api.spotify.com/v1/me/player", {
                headers: {
                  Authorization: 'Bearer ' + token //the token is a variable which holds the token
                }
            }).then((response) => {
                if(response.data){
                    this.item = response.data.item,
                    this.is_playing = response.data.is_playing,
                    this.progress_ms = response.data.progress_ms,
                    this.no_data = false /* We need to "reset" the boolean, in case the user does not give F5 and has opened his Spotify. */
                } else {
                    this.no_data = true
                }
                return;
            })
        },
        getHash: function () {
            // Get the hash of the url
            const hash = window.location.hash
              .substring(1)
              .split("&")
              .reduce(function(initial, item) {
                if (item) {
                  var parts = item.split("=");
                  initial[parts[0]] = decodeURIComponent(parts[1]);
                }
                return initial;
              }, {});
            window.location.hash = "";

            return hash;
        },
        setTokenFromHash: function() {
            this.token = this.getHash().access_token
            this.tick() // faster update uppon login
        }
    },
    components:{
        Player
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
</style>
