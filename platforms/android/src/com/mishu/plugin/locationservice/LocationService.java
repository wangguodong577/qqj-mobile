package com.mishu.plugin.locationservice;

import android.util.Log;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.location.Poi;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class LocationService extends CordovaPlugin {

    public LocationClient mLocationClient = null;
    private BDLocationListener locationListener = new LocationListener();
    public static CallbackContext locationCallbackContext = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("LocationService")) {
            locationCallbackContext = callbackContext;
            cordova.getActivity().runOnUiThread(new RunnableLocationService());
        }

        return true;
    }


    class RunnableLocationService implements Runnable {
        public void run() {
            mLocationClient = new LocationClient(cordova.getActivity());
            mLocationClient.registerLocationListener(locationListener);
            LocationClientOption option = new LocationClientOption();
            option.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);//可选，默认高精度，设置定位模式，高精度，低功耗，仅设备
            option.setCoorType("bd09ll");//可选，默认gcj02，设置返回的定位结果坐标系
            option.setScanSpan(0);//可选，默认0，即仅定位一次，设置发起定位请求的间隔需要大于等于1000ms才是有效的
            option.setIsNeedAddress(true);//可选，设置是否需要地址信息，默认不需要
            option.setOpenGps(true);//可选，默认false,设置是否使用gps
            option.setLocationNotify(true);//可选，默认false，设置是否当gps有效时按照1S1次频率输出GPS结果
            option.setIsNeedLocationDescribe(true);//可选，默认false，设置是否需要位置语义化结果，可以在BDLocation.getLocationDescribe里得到，结果类似于“在北京天安门附近”
            option.setIsNeedLocationPoiList(true);//可选，默认false，设置是否需要POI结果，可以在BDLocation.getPoiList里得到
//            option.setIgnoreKillProcess(false);//可选，默认false，定位SDK内部是一个SERVICE，并放到了独立进程，设置是否在stop的时候杀死这个进程，默认杀死
//            option.SetIgnoreCacheException(false);//可选，默认false，设置是否收集CRASH信息，默认收集
//            option.setEnableSimulateGps(false);//可选，默认false，设置是否需要过滤gps仿真结果，默认需要
            mLocationClient.setLocOption(option);
            mLocationClient.start(); //启动定位
        }
    }


    public class LocationListener implements BDLocationListener {

        public void onReceiveLocation(BDLocation location) {
            PluginResult result = null;
            try {
                JSONObject jsonObj = new JSONObject();
                jsonObj.put("lat",location.getLatitude());
                jsonObj.put("lng", location.getLongitude());
                jsonObj.put("city",location.getCity());
                jsonObj.put("city_code",location.getCityCode());
                jsonObj.put("address",location.getAddrStr());

                int state = 1; //1:成功 | 2:失败
                int stateCode = 0; //1:GPS  | 2:网络 | 3:离线 | 4: 定位失败 | 5:定位失败 飞行模式
                //GPS定位
                if (location.getLocType() == BDLocation.TypeGpsLocation){
                    stateCode = 1;
                } else if (location.getLocType() == BDLocation.TypeNetWorkLocation){
                    stateCode = 2;
                } else if (location.getLocType() == BDLocation.TypeOffLineLocation){
                    stateCode = 3;
                } else if (location.getLocType() == BDLocation.TypeServerError || location.getLocType() == BDLocation.TypeNetWorkException){
                    state = 2;
                    stateCode = 4;
                } else if(location.getLocType() == BDLocation.TypeCriteriaException){
                    state = 2;
                    stateCode = 5;
                }
                jsonObj.put("state",state);
                jsonObj.put("state_code",stateCode);
                result = new PluginResult(PluginResult.Status.OK, jsonObj);
                result.setKeepCallback(true);
            } catch (Exception e) {
                result = new PluginResult(PluginResult.Status.JSON_EXCEPTION);
                result.setKeepCallback(true);
            }

            locationCallbackContext.sendPluginResult(result);
        }
    }
}
