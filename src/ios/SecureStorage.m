#import <Foundation/Foundation.h>
#import <Security/Security.h>
#import "SecureStorage.h"
#import <Cordova/CDV.h>
#import "SAMKeychain.h"

@implementation SecureStorage

@synthesize keychainAccesssibilityMapping;

- (void)get:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    [self.commandDelegate runInBackground:^{
        NSError *error;

        SAMKeychainQuery *query = [[SAMKeychainQuery alloc] init];
        query.service = service;
        query.account = key;

        if ([query fetch:&error]) {
            [self successWithMessage: query.password : command.callbackId];
        } else {
            [self failWithMessage: @"Failure in SecureStorage.get()" : error : command.callbackId];
        }
    }];
}

- (void)set:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    NSString *value = [command argumentAtIndex:2];
    [self.commandDelegate runInBackground:^{
        NSError *error;

        if (self.keychainAccesssibilityMapping == nil) {

            if( [[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0 ){
                  self.keychainAccesssibilityMapping = [NSDictionary dictionaryWithObjectsAndKeys:
                                                      (__bridge id)(kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly), @"afterfirstunlockthisdeviceonly",
                                                      (__bridge id)(kSecAttrAccessibleAfterFirstUnlock), @"afterfirstunlock",
                                                      (__bridge id)(kSecAttrAccessibleWhenUnlocked), @"whenunlocked",
                                                      (__bridge id)(kSecAttrAccessibleWhenUnlockedThisDeviceOnly), @"whenunlockedthisdeviceonly",
                                                      (__bridge id)(kSecAttrAccessibleAlways), @"always",
                                                      (__bridge id)(kSecAttrAccessibleAlwaysThisDeviceOnly), @"alwaysthisdeviceonly",
                                                      (__bridge id)(kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly), @"whenpasscodesetthisdeviceonly",
                                                      nil];
            }
            else{
                  self.keychainAccesssibilityMapping = [NSDictionary dictionaryWithObjectsAndKeys:
                                                      (__bridge id)(kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly), @"afterfirstunlockthisdeviceonly",
                                                      (__bridge id)(kSecAttrAccessibleAfterFirstUnlock), @"afterfirstunlock",
                                                      (__bridge id)(kSecAttrAccessibleWhenUnlocked), @"whenunlocked",
                                                      (__bridge id)(kSecAttrAccessibleWhenUnlockedThisDeviceOnly), @"whenunlockedthisdeviceonly",
                                                      (__bridge id)(kSecAttrAccessibleAlways), @"always",
                                                      (__bridge id)(kSecAttrAccessibleAlwaysThisDeviceOnly), @"alwaysthisdeviceonly",
                                                      nil];
            }
        }

        NSString* keychainAccessibility = [[self.commandDelegate.settings objectForKey:[@"KeychainAccessibility" lowercaseString]] lowercaseString];

        if ([self.keychainAccesssibilityMapping objectForKey:(keychainAccessibility)] != nil) {
            CFTypeRef accessibility = (__bridge CFTypeRef)([self.keychainAccesssibilityMapping objectForKey:(keychainAccessibility)]);
            [SAMKeychain setAccessibilityType:accessibility];
        }

        SAMKeychainQuery *query = [[SAMKeychainQuery alloc] init];

        query.service = service;
        query.account = key;
        query.password = value;

        if ([query save:&error]) {
            [self successWithMessage: key : command.callbackId];
        } else {
            [self failWithMessage: @"Failure in SecureStorage.set()" : error : command.callbackId];
        }
    }];
}

- (void)remove:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    [self.commandDelegate runInBackground:^{
        NSError *error;

        SAMKeychainQuery *query = [[SAMKeychainQuery alloc] init];
        query.service = service;
        query.account = key;

        if ([query deleteItem:&error]) {
            [self successWithMessage: key : command.callbackId];
        } else {
            [self failWithMessage: @"Failure in SecureStorage.remove()" : error : command.callbackId];
        }
    }];
}

-(void)successWithMessage:(NSString *)message : (NSString *)callbackId
{
        CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
        [self.commandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

-(void)failWithMessage:(NSString *)message : (NSError *)error : (NSString *)callbackId
{
    NSString        *errorMessage = (error) ? [NSString stringWithFormat:@"%@ - %@", message, [error localizedDescription]] : message;
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMessage];

    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

@end
