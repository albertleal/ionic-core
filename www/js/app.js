/// <reference path="../../typings/underscore/underscore.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
angular.module('ionicApp.bundle', [
  'ionic',
  'ngCordova',
  'underscore',
  'ionicApp.controllers',
  'ionicApp.factories',
  'ionicApp.services',
]);

angular.module('underscore', []).factory('_', ['$window', function () {
  return window._;
}]);

var appModule = angular.module('ionicApp', ['ionic', 'ionicApp.bundle'])
  .run(function ($ionicPlatform, $state) {
  $ionicPlatform.ready(function () {
    if (window.StatusBar) {
      window.StatusBar.styleDefault();
    }
    $state.go('app.products');
  });

  $ionicPlatform.on("resume", function (event) {
  });

  $ionicPlatform.on("offline", function (event) {
    //cordova-plugin-network-information
  });

});


appModule.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  });
  $stateProvider.state('app.products', {
    url: "/products",
    views: {
      'menuContent': {
        templateUrl: "templates/products.list.html",
        controller: 'ProductsCtrl'
      }
    }
  });
  $stateProvider.state('app.single', {
    url: "/products/:productId",
    views: {
      'menuContent': {
        templateUrl: "templates/products.single.html",
        controller: 'ProductDetailCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/products');
});

var controllersModule = angular.module('ionicApp.controllers', []);

controllersModule.controller('AppCtrl', function ($scope) {
  $scope.language = {
    'menu': {
      'title': ''
    },
    'products': {
      'list': {
        'title': 'Mis deseos'
      },
      'single': {
        'bought': 'Ya lo tengo!',
        'cancel': 'Ya no lo quiero'
      },
      'new': {
        'title': 'Nuevo deseo'
      }
    }
  };
});

controllersModule.controller('ProductsNewCtrl', function ($scope) {
  $scope.takePicture = function () {
    navigator.camera.getPicture(function(imageData){
      alert("data:image/jpeg;base64," + imageData);
    }, function(message){
      alert('Failed because: ' + message);
    }, {
      quality: 50,
      destinationType: navigator.Camera.DestinationType.DATA_URL
    });
  };
});
controllersModule.controller('NavbarCtrl', function ($scope, $ionicModal, $cordovaCamera) {
  $ionicModal.fromTemplateUrl('templates/products.new.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.navigateToNewProduct = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function () {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function () {
    // Execute action
  });
});

controllersModule.controller('ProductsCtrl', function ($scope, $state, productsService) {
  productsService.getAll().then(function (products) {
    $scope.products = products;
  });
  $scope.navigateToDetail = function (id) {
    $state.go('app.single', {
      'productId': id
    });
  };
});

controllersModule.controller('ProductDetailCtrl', function ($scope, $stateParams, ProductsCollectionFactory) {
  $scope.product = ProductsCollectionFactory.getSingle($stateParams.productId);
});

var services = angular.module('ionicApp.services', []);
services.service('productsService', function ($q, ProductFactory, ProductsCollectionFactory) {
  this.getAll = function () {
    var deferred = $q.defer();
    if (ProductsCollectionFactory.isEmpty()) {
      console.log('isEmpty we should call an external api to fill the collection');
      ProductsCollectionFactory.insert(new ProductFactory(1, 'my product', 'this is just a short description', ['http://in1.ccio.co/d8/NA/yD/174655291768491481EM4WqwuEc.jpg','http://s4.thisnext.com/media/largest_dimension/F19379DD.jpg'], 'http://in1.ccio.co/d8/NA/yD/174655291768491481EM4WqwuEc.jpg', '19.95€', 'Zara Diagonal, Barcelona'));
      ProductsCollectionFactory.insert(new ProductFactory(2, 'my second product', 'second description', ['http://s4.thisnext.com/media/largest_dimension/F19379DD.jpg'], 'http://s4.thisnext.com/media/largest_dimension/F19379DD.jpg', '7.75€', 'Zara Diagonal, Barcelona'));
      ProductsCollectionFactory.insert(new ProductFactory(3, 'my third product', 'other description', null, null, "33,90€", 'Zara Diagonal, Barcelona'));
      ProductsCollectionFactory.insert(new ProductFactory(4, 'my third product', 'other description', [], null, "33,90€", 'Zara Diagonal, Barcelona'));
      deferred.resolve(ProductsCollectionFactory.getAll());
    } else {
      console.log('is filled');
      deferred.resolve(ProductsCollectionFactory.getAll());
    }
    return deferred.promise;
  };
});

var factoryModule = angular.module('ionicApp.factories', []);
factoryModule.factory('ProductsCollectionFactory', function () {
  var collection = [];

  return {
    isEmpty: function () {
      return _.isEmpty(collection);
    },
    insert: function (product) {
      collection.push(product);
    },
    getAll: function () {
      return collection;
    },
    getSingle: function (id) {
      return _.find(collection, function (product) { return product.id === parseInt(id); });
    }
  };
});
factoryModule.factory('ProductFactory', function () {
  var Product = function (id, name, description, imageUrlArray, imageSquareUrl, price, place) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageUrlArray = imageUrlArray !== null && imageUrlArray.length !== 0 ? imageUrlArray : ['img/products/default.alpha.png'];
    this.imageSquareUrl = imageSquareUrl !== null ? imageSquareUrl : 'img/products/default.square.alpha.png';
    this.price = price;
    this.place = place;
  };
  return Product;
});