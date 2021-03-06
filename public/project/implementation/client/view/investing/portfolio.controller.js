(function () {
    "use strict";
    angular
        .module("SimulyApp")
        .controller("PortfolioController", PortfolioController);

    function PortfolioController($rootScope, GameService, PortfolioService, CompanyService, $uibModal, $location, $routeParams) {
        var vm = this;
        vm.successMessage = null;
        vm.failureMessage = null;
        vm.currentUser = $rootScope.currentUser;
        vm.gameTitle = $routeParams.gameTitle;
        vm.currentPortfolio = [];
        vm.summaryTable = [];
        vm.companies = [];
        vm.totalEquity = [];

        vm.buildTable = buildTable;
        vm.advance = advance;
        vm.endGame = endGame;
        vm.updateReturn = updateReturn;
        vm.buy = buy;
        vm.sell = sell;
        vm.waitCount = waitCount;
        vm.resetStatus = resetStatuses;
        vm.advanceCurrentPortfolio = advanceCurrentPortfolio;

        function init() {
            $rootScope.$broadcast('new-game', vm.gameTitle);
            PortfolioService
                .findPortfolioForUser(vm.currentUser.username, vm.gameTitle)
                .then(function(response){
                    vm.currentPortfolio = response.data;
                    GameService
                        .findAllCompaniesForGame(vm.currentPortfolio.gameName)
                        .then(function (response){
                            if(response.data) {
                                vm.companies = response.data;
                                vm.currentTurn = vm.currentPortfolio.currentTurn;
                                renderBar();
                                buildTable();
                            }
                        });
                });
        }
        init();

        function waitCount(){
            vm.waitCount = 0;
            for (var i = 0; i < vm.portfolios.length; i++) {
                if (vm.portfolios[i].status === 'wait') {
                    vm.waitCount = vm.waitCount + 1
                }
            }
        }

        function advance(){
            PortfolioService
                .findPortfoliosInGame(vm.currentPortfolio.gameName)
                .then(function (response){
                    if(response.data) {
                        vm.portfolios = response.data;
                        waitCount();
                        if (vm.portfolios.length === vm.waitCount){
                            resetStatuses()
                        }
                        if (vm.currentPortfolio.status === 'passable'){
                            advanceCurrentPortfolio()
                        }
                        else {
                            vm.failureMessage = "Please wait for other players to advance"
                        }
                    }
                })
        }

        function resetStatuses(){
            PortfolioService
                .resetStatusForGame(vm.currentPortfolio.gameName)
                .then(function (response){
                    if(response.data) {
                        vm.portfolios = response.data;
                        advanceCurrentPortfolio();
                    }
                })
        }

        function advanceCurrentPortfolio(){
            var oldPortfolio = vm.summaryTable;
            PortfolioService
                .advanceTurnForPortfolio(vm.currentPortfolio._id, vm.currentPortfolio.currentTurn)
                .then(function(response){
                    if (response.data){
                        updateReturn();
                        GameService
                            .findAllCompaniesForGame(vm.gameTitle)
                            .then(function (response){
                                if(response.data) {
                                    vm.companies = response.data;
                                    refreshPortfolio(oldPortfolio);
                                }
                            });
                    }
                });
        }

        function updateReturn(){
            var turnReturn = Math.round(((vm.currentPortfolio.cash_remaining + vm.totalEquity) / 1000 - 1) * 100);
            PortfolioService
                .updateReturn(vm.currentPortfolio._id, vm.currentPortfolio.currentTurn, turnReturn)
                .then(function(response){

                });
        }

        function endGame(){
            PortfolioService
                .advanceTurnForPortfolio(vm.currentPortfolio._id, vm.currentPortfolio.currentTurn + 1)
                .then(function(response){
                    if (response.data){
                        updateReturn();
                        PortfolioService
                            .endGameForUser(vm.currentPortfolio._id)
                            .then(function (response){
                                if(response.data) {
                                    $location.url("/ranking/" + vm.currentPortfolio.username + '/' + vm.currentPortfolio.gameName);
                                }
                            });
                    }
                });
            $rootScope.$broadcast('game-over')
        }

        function refreshPortfolio (oldPortfolio){
            PortfolioService
                .findPortfolioForUser(vm.currentUser.username, vm.gameTitle)
                .then(function(response){
                    vm.currentPortfolio = response.data;
                    vm.currentTurn = vm.currentPortfolio.currentTurn;
                    renderBar();
                    buildTable();
                    var newPortfolio = vm.summaryTable;
                    turnSummary(oldPortfolio, newPortfolio, vm.currentTurn);
                });
        }

        function turnSummary(oldPortfolio, newPortfolio, turn){
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'view/investing/nextTurn.popup.view.html',
                controller: 'NextTurnPopupController',
                controllerAs: "model",
                size: 'lg',
                resolve: {
                    oldPortfolio : function () {
                        return  oldPortfolio
                    },
                    newPortfolio : function () {
                        return  newPortfolio
                    },
                    turn : function () {
                        return  turn
                    }
                }
            })
        }

        function refresh(selectedCompany){
            var prices;
            var identifier;
            for (var i = 0; i < vm.summaryTable.length; i++){
                if (vm.summaryTable[i].name === selectedCompany.name){
                    prices = vm.summaryTable[i].prices;
                    identifier = vm.companies[i].identifier;
                }
            }
            vm.selectedCompany = {
                name: selectedCompany.name,
                shares: selectedCompany.shares,
                currentPrice : prices[vm.currentTurn],
                tradeType: selectedCompany.tradeType,
                prices : prices,
                totalEquity: vm.totalEquity,
                identifier: identifier
            }
        }

        function buy(index) {
            var temp;
            temp = {
                name: vm.summaryTable[index].name,
                shares: 1,
                tradeType: "Buy"
            };
            refresh(temp);

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

        function sell(index) {
            var temp;
            temp = {
                name: vm.summaryTable[index].name,
                shares: vm.summaryTable[index].shares,
                tradeType: "Sell"
            };
            refresh(temp);

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

        function buildTable(){
            vm.summaryTable = [];
            vm.totalEquity = [];
            for (var i = 0; i < vm.currentPortfolio.holdings.length; i++){
                vm.totalEquity = Math.round(vm.totalEquity + vm.currentPortfolio.holdings[i].shares *
                    vm.currentPortfolio.holdings[i].prices[vm.currentPortfolio.currentTurn]);
                var company = {
                    identifier: vm.currentPortfolio.holdings[i].identifier,
                    name: vm.currentPortfolio.holdings[i].company_name,
                    shares: vm.currentPortfolio.holdings[i].shares,
                    prices: vm.currentPortfolio.holdings[i].prices,
                    price_paid: vm.currentPortfolio.holdings[i].price_paid,
                    return: Math.round(((vm.currentPortfolio.holdings[i].prices[vm.currentPortfolio.currentTurn] /
                            vm.currentPortfolio.holdings[i].price_paid) - 1)*100),
                    total_value: vm.currentPortfolio.holdings[i].shares *
                            vm.currentPortfolio.holdings[i].prices[vm.currentPortfolio.currentTurn]
                };
                vm.summaryTable.push(company)
            }
        }

        function renderBar() {
            var periods = [];
            var j = 1;
            for (var i=1; i <= 10; i++){
                if (i < vm.currentPortfolio.currentTurn){
                    periods.push("t"+i);
                }
                else {
                    periods.push("fy"+j);
                    j++;
                }
            }

            var returns = vm.currentPortfolio.portfolio_return;

            var returnsChartData = [];
            for (var i = 0; i < periods.length; i++) {
                if (periods[i].substring(0, 1) == "t") {
                    returnsChartData.push({
                        "periods": periods[i],
                        "returns": returns[i],
                        "color": "#2980B9"
                    })
                }
                else {
                    returnsChartData.push( {
                        "periods": periods[i],
                        "returns": returns[i],
                        "color": "#2980B9"
                    } )
                }
            }
            CompanyService.createBarGraph(returnsChartData, "returnsChart", "returns");
        }
    }
})();