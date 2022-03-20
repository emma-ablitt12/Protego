#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import "Firebase.h" 
#import "RNFirebaseMessaging.h"
#import "FirebasePushNotifications.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
