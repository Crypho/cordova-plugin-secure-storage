#import <Cordova/CDVPlugin.h>

@interface SecureStorage : CDVPlugin

- (void)get:(CDVInvokedUrlCommand*)command;
- (void)set:(CDVInvokedUrlCommand*)command;
- (void)remove:(CDVInvokedUrlCommand*)command;

@property (nonatomic, copy) id keychainAccesssibilityMapping;

@end
