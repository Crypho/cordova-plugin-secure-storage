#import <Foundation/Foundation.h>
#import "SecureStorage.h"
#import <Cordova/CDV.h>

@implementation SecureStorage

@synthesize callbackId;

- (void)get:(CDVInvokedUrlCommand*)command
{

}

- (void)set:(CDVInvokedUrlCommand*)command
{

}

- (void)remove:(CDVInvokedUrlCommand*)command
{

}

-(void)successWithMessage:(NSString *)message
{
    if (self.callbackId != nil)
    {
        CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
        [self.commandDelegate sendPluginResult:commandResult callbackId:self.callbackId];
    }
}

-(void)failWithMessage:(NSString *)message withError:(NSError *)error
{
    NSString        *errorMessage = (error) ? [NSString stringWithFormat:@"%@ - %@", message, [error localizedDescription]] : message;
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMessage];

    [self.commandDelegate sendPluginResult:commandResult callbackId:self.callbackId];
}

@end
