const _ = require('underscore');
const ipc = require('ipc');
const numeral = require('numeral');
const i18n = require('../../modules/i18n.js');

var lastData = {};

// angular app
var startScreenApp = angular.module('startScreenApp', ['ngSanitize']);


angular.element(document).ready(function () {
    // close app
    document.getElementsByClassName('close')[0].addEventListener('click', function(){
        ipc.send('closeApp');
    }, false);

    // start app
    document.getElementsByClassName('start-app')[0].addEventListener('click', function(){
        ipc.send('startApp');
    }, false);
});



startScreenApp.controller('mainCtrl', ['$scope', function ($scope) {

    ipc.on('startScreenText', function(text, data){

        // show text
        if(text.indexOf('privateChainTimeout') === -1 &&
           text.indexOf('privateChainTimeoutClear') === -1)
            $scope.text = i18n.t(text);


        // make window closeable and image smaller on TIMEOUT
        if(text.indexOf('nodeConnectionTimeout') !== -1 ||
           text.indexOf('nodeBinaryNotFound') !== -1 ||
           text.indexOf('nodeSyncing') !== -1 ||
           text.indexOf('privateChainTimeout') !== -1) {

            // make icon small
            $scope.smallLogo = true;


            // SHOW SYNC STATUS
            if(text.indexOf('nodeSyncing') !== -1) {
                lastData = _.extend(lastData, data || {});
                var progress = ((lastData.currentBlock - lastData.startingBlock) / (lastData.highestBlock - lastData.startingBlock)) * 100;

                lastData.currentBlock = numeral(lastData.currentBlock).format('0,0');
                lastData.highestBlock = numeral(lastData.highestBlock).format('0,0');

                if(progress === 0)
                    progress = 1;

                // improve time format
                // lastData.timeEstimate = lastData.timeEstimate.replace('h','h ').replace('m','m ').replace(/ +/,' ');

                // show node info text
                if(!lastData.highestBlock)
                    $scope.text += '<br><small>'+ i18n.t('mist.startScreen.nodeSyncConnecting') +'</small>';
                else
                    $scope.text += '<br><small>'+ i18n.t('mist.startScreen.nodeSyncInfo', lastData) +'</small>';
                
                // show progress bar
                $scope.showProgressBar = true;

                // set progress value
                if(_.isFinite(progress))
                    $scope.progress = progress;


            // HIDE PRIVATE chain text
            } else if(text.indexOf('privateChainTimeoutClear') !== -1) {
                $scope.showStartAppButton = false;


            // SHOW PRIVATE chain text
            } else if(text.indexOf('privateChainTimeout') !== -1) {
                
                $scope.startAppButtonText = i18n.t(text);
                $scope.showStartAppButton = true;


            // on ERROR MAKE CLOSEABLE
            } else {
                // show text with path
                $scope.text = i18n.t(text, {path: data});
            }
        }


        if(!$scope.$$phase) {
            $scope.$digest($scope);
        }

    });
}]);
