(function(){
    "use strict";
    angular
        .module("SimulyApp")
        .controller("HeaderController", headerController);

    function headerController($location, $scope, UserService) {
        $scope.$location = $location;
        $scope.logout = logout;
        $scope.search = search;

        function logout() {
            UserService.setCurrentUser(null);
            $location.url("/home");
        }

        function search(){
            $location.url("/search");
        }
    }
})();
