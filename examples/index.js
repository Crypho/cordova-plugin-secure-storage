var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.testSecureStorage();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    testSecureStorage: function () {
        ss = new cordova.plugins.SecureStorage(function () {
        ss.set(
            function (value) {
                console.log('Success, set ' + value);
                ss.get(
                    function (value) { console.log('Success, got ' + value); },
                    function (error) { console.log('Error, ' + error); },
                    'mykey');

            },
            function (error) { console.log('Error, ' + error); },
            'mykey', 'myvalue');
        setTimeout(
        	function(){
        		ss.remove(
					function (value) { console.log('Success, removed ' + value); },
        			function (error) { console.log('Error, ' + error); },
        			'mykey');
        	},
        	1000)

        }, function () {console.log('Failed initializing SecureStorage');}, 'testing');

    }
};
window.app = app;
app.initialize();