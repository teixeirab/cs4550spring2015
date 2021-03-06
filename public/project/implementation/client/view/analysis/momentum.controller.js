(function () {
    "use strict";
    angular
        .module("SimulyApp")
        .controller("MomentumController", MometumController);

    function MometumController(CompanyService,PortfolioService, $routeParams, $rootScope) {
        var vm = this;
        vm.company_data = [];
        vm.identifier = $routeParams.identifier;
        vm.turn = $routeParams.turn;
        vm.identifier = $routeParams.identifier;
        vm.generated_name = $routeParams.generatedName;
        vm.portfolioId = $routeParams.portfolioId;
        vm.trade= trade;

        function init() {
            CompanyService
                .getCompanyData(vm.identifier, "momentum")
                .then(function(response) {
                    if (response.data) {
                        vm.company_data = response.data;
                        renderBar()
                    }
                });
            PortfolioService
                .findPortfolioById(vm.portfolioId)
                .then(function(response) {
                    if (response.data) {
                        vm.currentPortfolio = response.data;
                        $rootScope.$broadcast('new-game', vm.currentPortfolio.gameName)
                    }
                });
            var data = {
                turn: vm.turn,
                generated_name: vm.generated_name,
                identifier: vm.identifier,
                portfolioId: vm.portfolioId
            };
            $rootScope.$broadcast('company', data);
        }
        init();

        function trade(name){
            console.log(name);
            vm.selectedCompany = {
                name: name,
                shares: 1,
                tradeType: "Buy",
                currentPrice : vm.company_data.current_price[vm.turn]
            };

            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'view/investing/trading.popup.view.html',
                controller: 'TradingPopupController',
                controllerAs: "model",
                size: 'lg',
                resolve: {
                    selectedTrade : function () {
                        return  vm.selectedCompany
                    },
                    currentPortfolio : function () {
                        return  vm.currentPortfolio
                    }
                }
            });
        }

        function getPeriods(){
            vm.periods = [];
            var j = 1;
            for (var i =0; i <= 10; i++){
                if (i < vm.turn){
                    vm.periods.push("t"+i);
                }
                else {
                    vm.periods.push("fy"+j);
                    j++;
                }
            }
        }

        function renderBar() {
            var prices = vm.company_data.price;
            getPeriods();

            var pricesChartData = [];
            for (var i = 0; i < vm.periods.length; i++) {
                if (vm.periods[i].substring(0, 1) == "t") {
                    pricesChartData.push({
                        "periods": vm.periods[i],
                        "prices": prices[i],
                        "color": "#2980B9"
                    })
                }
            }
            CompanyService.createLineGraph(pricesChartData, "pricesChart", "prices");
        }
    }
})();