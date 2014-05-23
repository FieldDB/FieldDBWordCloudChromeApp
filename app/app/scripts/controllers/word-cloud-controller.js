/*global WordCloudApp, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the wordCloudStorage service
 * - exposes the model to the template and provides event handlers
 */
WordCloudApp.controller('WordCloudCtrl', function WordCloudCtrl($scope, $location, $filter, wordCloudStorage) {
  var wordClouds = $scope.wordClouds = [];

  // If there is saved data in storage, use it.
  // https://developer.chrome.com/apps/app_codelab5_data
  $scope.load = function(value) {
    if (value) {
      wordClouds = $scope.wordClouds = value;
      $scope.remainingCount = $filter('filter')(wordClouds, {
        archived: false
      }).length;
    }
  };

  wordCloudStorage.get(function(wordClouds) {
    console.log('Got some wordClouds', wordClouds);
    $scope.$apply(function() {
      $scope.load(wordClouds);
    });
  });

  $scope.newWordCloud = '';
  $scope.remainingCount = 0;
  $scope.editedWordCloud = null;

  if ($location.path() === '') {
    $location.path('/');
  }

  $scope.location = $location;

  $scope.$watch('location.path()', function(path) {
    $scope.statusFilter = {
      '/active': {
        archived: false
      },
      '/archived': {
        archived: true
      }
    }[path];
  });

  $scope.$watch('remainingCount == 0', function(val) {
    $scope.allChecked = val;
  });

  $scope.addWordCloud = function() {
    var newWordCloud = $scope.newWordCloud.trim();
    if (newWordCloud.length === 0) {
      return;
    }

    wordClouds.push({
      title: newWordCloud,
      archived: false
    });
    wordCloudStorage.put(wordClouds);

    $scope.newWordCloud = '';
    $scope.remainingCount++;
  };

  $scope.editWordCloud = function(wordCloud) {
    $scope.editedWordCloud = wordCloud;
    // Clone the original wordCloud to restore it on demand.
    $scope.originalWordCloud = angular.extend({}, wordCloud);
  };

  $scope.doneEditing = function(wordCloud) {
    $scope.editedWordCloud = null;
    wordCloud.title = wordCloud.title.trim();

    if (!wordCloud.title) {
      $scope.removeWordCloud(wordCloud);
    }

    wordCloudStorage.put(wordClouds);
  };

  $scope.revertEditing = function(wordCloud) {
    wordClouds[wordClouds.indexOf(wordCloud)] = $scope.originalWordCloud;
    $scope.doneEditing($scope.originalWordCloud);
  };

  $scope.removeWordCloud = function(wordCloud) {
    $scope.remainingCount -= wordCloud.archived ? 0 : 1;
    wordClouds.splice(wordClouds.indexOf(wordCloud), 1);
    wordCloudStorage.put(wordClouds);
  };

  $scope.wordCloudArchived = function(wordCloud) {
    $scope.remainingCount += wordCloud.archived ? -1 : 1;
    wordCloudStorage.put(wordClouds);
  };

  $scope.clearArchivedWordClouds = function() {
    $scope.wordClouds = wordClouds = wordClouds.filter(function(val) {
      return !val.archived;
    });
    wordCloudStorage.put(wordClouds);
  };

  $scope.markAll = function(archived) {
    wordClouds.forEach(function(wordCloud) {
      wordCloud.archived = !archived;
    });
    $scope.remainingCount = archived ? wordClouds.length : 0;
    wordCloudStorage.put(wordClouds);
  };
});
