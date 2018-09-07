/*global xrmApp:false*/
(function () {
    'use strict';
    xrmApp.controller('AppointmentEditController', ['$state', '$stateParams', '$injector', '$rootScope', '$scope', '$ionicHistory', 'AppointmentService', 'rt', function ($state, $stateParams, $injector, $rootScope, $scope, $ionicHistory, myService, rt) {
        $scope.vm = {};

        var id = $stateParams.id || '';

        function _init() {
            $scope.vm.getLocation = _getLocation;
            $scope.vm.saveClick = _saveClick;
            $scope.vm.chooseAccount = _chooseAccount;
            $scope.vm.chooseContact = _chooseContact;
            $scope.vm.chooseOpportunity = _chooseOpportunity;

            rt.showLoadingToast('正在加载数据...');
            _loadData(function (data) {
                $scope.vm.data = data;

                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        function _loadData(success, failure) {
            myService.getAppointmentInfo(id)
                .success(function (data) {
                    if (!rt.isNull(data.scheduledstart)) {
                        data.scheduledstart = new Date(data.scheduledstart);
                    }

                    if (!rt.isNull(data.scheduledend)) {
                        data.scheduledend = new Date(data.scheduledend);
                    }

                    if (success) {
                        success(data);
                    }
                })
                .error(function (error) {
                    if (failure) {
                        failure();
                    }

                    rt.showErrorToast(error);
                });
        }

        function _getLocation() {
            rt.getLocation()
                .then(function (location) {
                    $scope.vm.data.new_location = location.address;
                });
        }

        function _chooseAccount() {
            rt.showDialog('module/lookup/accountLookupView.html', $scope, function (account) {
                if (rt.isNull($scope.vm.data.new_account_id)) {
                    $scope.vm.data.new_account_id = {};
                }

                if (rt.isNull(account)) {
                    $scope.vm.data.new_account_id.Id = "";
                    $scope.vm.data.new_account_id.Text = "";
                    return;
                }
                $scope.vm.data.new_account_id.Id = account.accountid;
                $scope.vm.data.new_account_id.Text = account.name;
            });
        }

        function _chooseContact() {
            rt.showDialog('module/lookup/contactLookupView.html', $scope, function (v) {
                if (rt.isNull($scope.vm.data.new_contact)) {
                    $scope.vm.data.new_contact = {};
                }
                if (rt.isNull($scope.vm.data.new_account_id)) {
                    $scope.vm.data.new_account_id = {};
                }
                $scope.vm.data.new_account_id.Id = "";
                $scope.vm.data.new_account_id.Text = "";

                if (rt.isNull(v)) {
                    $scope.vm.data.new_contact.Id = "";
                    $scope.vm.data.new_contact.Text = "";
                    return;
                }
                $scope.vm.data.new_contact.Id = v.id;
                $scope.vm.data.new_contact.Text = v.name;
                $scope.vm.data.new_account_id = v.new_account_id;
            });
        }

        function _chooseOpportunity() {
            rt.showDialog('module/lookup/opportunityLookupView.html', $scope, function (opportunity) {
                if (rt.isNull($scope.vm.data.new_opportunity_id)) {
                    $scope.vm.data.new_opportunity_id = {};
                }

                if (rt.isNull(opportunity)) {
                    $scope.vm.data.new_opportunity_id.Id = "";
                    $scope.vm.data.new_opportunity_id.Text = "";
                    return;
                }
                $scope.vm.data.new_opportunity_id.Id = opportunity.opportunityid;
                $scope.vm.data.new_opportunity_id.Text = opportunity.name;
            });
        }

        function _saveClick() {
            if(rt.isNullOrEmptyString($scope.vm.data.appointmentid)){
                $scope.vm.data.appointmentid = rt.newGuid();
            }

            rt.showLoadingToast("正在保存...");
            myService.saveAppointment($scope.vm.data)
                .success(function () {
                    rt.hideLoadingToast();
                    rt.showSuccessToast('保存成功');

                    rt.rootScope.$broadcast("appointment-refresh");
                })
                .error(function (error) {
                    rt.hideLoadingToast();
                    rt.showErrorToast(error);
                });
        }

        _init();
    }]);
})();