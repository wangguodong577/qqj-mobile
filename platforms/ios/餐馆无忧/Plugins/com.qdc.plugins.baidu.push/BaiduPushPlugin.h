//
//  BaiduPushPlugin.h
//  HaobanPlugin
//
//  Created by 马杰磊 on 15/6/17.
//  Copyright (c) 2015年 NTTData. All rights reserved.
//

#import <Cordova/CDV.h>
#import <CoreLocation/CoreLocation.h>

@interface BaiduPushPlugin : CDVPlugin
@property (nonatomic) CDVPluginResult *result;

/*!
 @method
 @abstract 绑定
 */
- (void)startWork:(CDVInvokedUrlCommand*)command;

/*!
 @method
 @abstract 解除绑定
 */
- (void)stopWork:(CDVInvokedUrlCommand*)command;

/*!
 @method
 @abstract 回复绑定
 */
- (void)resumeWork:(CDVInvokedUrlCommand*)command;

/*!
@method
@abstract 设置Tag
*/
- (void)setTags:(CDVInvokedUrlCommand*)command;

/*!
 @method
 @abstract 删除Tag
 */
- (void)delTags:(CDVInvokedUrlCommand*)command;

@end