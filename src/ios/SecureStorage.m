#import <Foundation/Foundation.h>
#import <Security/Security.h>
#import "SecureStorage.h"
#import <Cordova/CDV.h>
#import "SSKeychain.h"

@implementation SecureStorage

@synthesize callbackId;
@synthesize keychainAccesssibilityMapping;

- (void)get:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    NSError *error;

    self.callbackId = command.callbackId;

    SSKeychainQuery *query = [[SSKeychainQuery alloc] init];
    query.service = service;
    query.account = key;

    if ([query fetch:&error]) {
        [self successWithMessage: query.password];
    } else {
        [self failWithMessage: @"Failure in SecureStorage.get()" withError: error];
    }
}

- (void)set:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    NSString *value = [command argumentAtIndex:2];
    NSError *error;

    self.callbackId = command.callbackId;

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
        [SSKeychain setAccessibilityType:accessibility];
    }

    SSKeychainQuery *query = [[SSKeychainQuery alloc] init];

    query.service = service;
    query.account = key;
    query.password = value;

    if ([query save:&error]) {
        [self successWithMessage: key];
    } else {
        [self failWithMessage: @"Failure in SecureStorage.set()" withError: error];
    }
}

- (void)remove:(CDVInvokedUrlCommand*)command
{
    NSString *service = [command argumentAtIndex:0];
    NSString *key = [command argumentAtIndex:1];
    NSError *error;

    self.callbackId = command.callbackId;

    SSKeychainQuery *query = [[SSKeychainQuery alloc] init];
    query.service = service;
    query.account = key;

    if ([query deleteItem:&error]) {
        [self successWithMessage: key];
    } else {
        [self failWithMessage: @"Failure in SecureStorage.get()" withError: error];
    }
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
