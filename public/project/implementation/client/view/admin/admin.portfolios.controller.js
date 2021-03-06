(function(){
    "use strict";
    angular
        .module("SimulyApp")
        .controller("AdminPortfoliosController", AdminPortfoliosController);

    function AdminPortfoliosController(PortfolioService, $routeParams, cssInjector) {
        var vm = this;
        vm.portfolios = [];
        var portfolioId = $routeParams.portfolioId;
        vm.deletePortfolio = deletePortfolio;
        vm.updatePortfolio = updatePortfolio;
        vm.selectPortfolio = selectPortfolio;
        vm.addPortfolio = addPortfolio;

        function init() {
            PortfolioService
                .findAllPortfolios()
                .then(function (response){
                    if(response.data) {
                        vm.portfolios = response.data
                    }
                })
        }
        init();

        function deletePortfolio(company){
            PortfolioService
                .deletePortfolio(company._id)
                .then(function(response){
                    if(response.data) {
                        init()
                    }
                });
        }

        function updatePortfolio(company){
            PortfolioService
                .updatePortfolio(company._id, company)
                .then(function(response){
                    if(response.data) {
                        init()
                    }
                });
        }

        function selectPortfolio(index){
            vm.portfolio = vm.portfolios[index];
        }

        function addPortfolio(company){
            PortfolioService
                .createPortfolio(company)
                .then(function(response){
                    if(response.data) {
                        init()
                    }
                });
        }
    }
})();
