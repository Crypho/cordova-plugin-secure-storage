#import <Cordova/CDVPlugin.h>

@interface SecureStorage : CDVPlugin

- (void)init:(CDVInvokedUrlCommand*)command;
- (void)get:(CDVInvokedUrlCommand*)command;
- (void)set:(CDVInvokedUrlCommand*)command;
- (void)remove:(CDVInvokedUrlCommand*)command;
- (void)keys:(CDVInvokedUrlCommand*)command;
- (void)clear:(CDVInvokedUrlCommand*)command;

@property (nonatomic, copy) id keychainAccesssibilityMapping;

@end
