angular.module('cgwy')
    .factory('HistoryUtil', function ($ionicHistory,$timeout) {
	    var service = {};

        /**
         *  返回stateName 相对的上一页面
         *  主要处理ion-tab ui-sref="..." 重新在viewHistory.histories建立新分支,
         *  导致$ionicHistory.goBack() 或者 $ionicHistory.goBack([backCount]) 无法返回的问题
         */
		service.goBackView = function (stateName) {
		
			var views = $ionicHistory.viewHistory().views;
    		var viewHistory = $ionicHistory.viewHistory();
    		var stackViews = $ionicHistory.viewHistory().histories["root"].stack;
    		var currentView = null;

			var i = stackViews.length-1;
			while(i >= 0){
				var view = stackViews[i];
				if(view.stateName == stateName){
					currentView = view;
					break;
				}
				i--;
			}
    		
			viewHistory.currentView = currentView ? currentView : null;
    		viewHistory.backView = views[viewHistory.currentView.backViewId] ?  views[viewHistory.currentView.backViewId] : null;
		    viewHistory.forwardView = views[viewHistory.currentView.forwardViewId] ? views[viewHistory.currentView.forwardViewId] : null;

    		
     		var currentHistory = viewHistory.histories[currentView.historyId];
			var newCursor = currentHistory.cursor ;
			if (newCursor < 1) {
			  newCursor = 1;
			}
			
			currentHistory.cursor = newCursor;

    		var cursor = newCursor - 1;
        	var clearStateIds = [];
	        var fwdView = views[currentHistory.stack[cursor].forwardViewId];
	        
	        while (fwdView) {
			  clearStateIds.push(fwdView.stateId || fwdView.viewId);
			  cursor++;
			  if (cursor >= currentHistory.stack.length) break;
			  fwdView = views[currentHistory.stack[cursor].forwardViewId];
			}
        
        
			if (clearStateIds.length) {
			  $timeout(function() {
				$ionicHistory.clearCache(clearStateIds);
			  }, 600);
			}
        
        	 viewHistory.backView && viewHistory.backView.go();
        }
  
    return service;
});
