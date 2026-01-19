/**
 * User-friendly error messages utility
 * Converts Firebase and other technical errors to friendly messages
 */

import { FirebaseError } from "firebase/app";

interface FriendlyError {
    title: string;
    description: string;
}

/**
 * Firebase Auth error codes mapping
 */
const authErrorMessages: Record<string, FriendlyError> = {
    "auth/user-not-found": {
        title: "Account Not Found",
        description: "No account found with this email. Please sign up to create one.",
    },
    "auth/wrong-password": {
        title: "Incorrect Password",
        description: "The password you entered is incorrect. Please try again or reset your password.",
    },
    "auth/invalid-credential": {
        title: "Invalid Credentials",
        description: "The email or password you entered is incorrect. Please try again.",
    },
    "auth/invalid-email": {
        title: "Invalid Email",
        description: "Please enter a valid email address.",
    },
    "auth/email-already-in-use": {
        title: "Email Already Registered",
        description: "This email is already registered. Please try logging in instead.",
    },
    "auth/weak-password": {
        title: "Weak Password",
        description: "Your password is too weak. Please use at least 6 characters.",
    },
    "auth/user-disabled": {
        title: "Account Disabled",
        description: "This account has been disabled. Please contact support for help.",
    },
    "auth/too-many-requests": {
        title: "Too Many Attempts",
        description: "Too many failed attempts. Please wait a few minutes and try again.",
    },
    "auth/network-request-failed": {
        title: "Connection Error",
        description: "Unable to connect. Please check your internet connection and try again.",
    },
    "auth/popup-closed-by-user": {
        title: "Sign In Cancelled",
        description: "The sign-in popup was closed. Please try again.",
    },
    "auth/requires-recent-login": {
        title: "Session Expired",
        description: "For security, please log out and log back in to continue.",
    },
};

/**
 * Firebase Storage error codes mapping
 */
const storageErrorMessages: Record<string, FriendlyError> = {
    "storage/unauthorized": {
        title: "Upload Not Allowed",
        description: "You don't have permission to upload files. Please try again later.",
    },
    "storage/canceled": {
        title: "Upload Cancelled",
        description: "The file upload was cancelled.",
    },
    "storage/unknown": {
        title: "Upload Failed",
        description: "Something went wrong while uploading your file. Please try again.",
    },
    "storage/quota-exceeded": {
        title: "Storage Full",
        description: "Storage limit reached. Please contact support.",
    },
    "storage/object-not-found": {
        title: "File Not Found",
        description: "The requested file could not be found.",
    },
    "storage/retry-limit-exceeded": {
        title: "Upload Failed",
        description: "Upload failed after multiple attempts. Please try again later.",
    },
};

/**
 * Firebase Firestore error codes mapping
 */
const firestoreErrorMessages: Record<string, FriendlyError> = {
    "permission-denied": {
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
    },
    "not-found": {
        title: "Not Found",
        description: "The requested data could not be found.",
    },
    "already-exists": {
        title: "Already Exists",
        description: "This item already exists.",
    },
    "resource-exhausted": {
        title: "Service Busy",
        description: "The service is temporarily busy. Please try again in a moment.",
    },
    "failed-precondition": {
        title: "Action Failed",
        description: "This action cannot be completed right now. Please try again.",
    },
    unavailable: {
        title: "Service Unavailable",
        description: "The service is temporarily unavailable. Please try again later.",
    },
};

/**
 * Default error messages for common scenarios
 */
const defaultErrors: Record<string, FriendlyError> = {
    network: {
        title: "Connection Error",
        description: "Please check your internet connection and try again.",
    },
    generic: {
        title: "Something Went Wrong",
        description: "An unexpected error occurred. Please try again.",
    },
    login: {
        title: "Login Failed",
        description: "Unable to log in. Please check your credentials and try again.",
    },
    signup: {
        title: "Sign Up Failed",
        description: "Unable to create your account. Please try again.",
    },
    profile: {
        title: "Profile Error",
        description: "There was a problem with your profile. Please try again.",
    },
    message: {
        title: "Message Failed",
        description: "Unable to send your message. Please try again.",
    },
    load: {
        title: "Loading Error",
        description: "Unable to load data. Please refresh and try again.",
    },
};

/**
 * Get a user-friendly error message from any error
 * @param error - The error object (can be FirebaseError, Error, or unknown)
 * @param context - Optional context to provide better error messages (e.g., 'login', 'signup', 'profile')
 * @returns FriendlyError object with title and description
 */
export function getUserFriendlyError(
    error: unknown,
    context?: "login" | "signup" | "profile" | "message" | "load" | "generic"
): FriendlyError {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("network")) {
        return defaultErrors.network;
    }

    // Handle Firebase errors
    if (error instanceof FirebaseError) {
        // Check auth errors
        if (authErrorMessages[error.code]) {
            return authErrorMessages[error.code];
        }

        // Check storage errors
        if (storageErrorMessages[error.code]) {
            return storageErrorMessages[error.code];
        }

        // Check firestore errors
        if (firestoreErrorMessages[error.code]) {
            return firestoreErrorMessages[error.code];
        }

        // For unknown Firebase errors, use context-based fallback
        console.error(`Unhandled Firebase error code: ${error.code}`, error.message);
    }

    // Use context-based default if provided
    if (context && defaultErrors[context]) {
        return defaultErrors[context];
    }

    // Generic fallback
    return defaultErrors.generic;
}

/**
 * Get just the description for a friendly error - useful for toasts
 */
export function getFriendlyErrorMessage(
    error: unknown,
    context?: "login" | "signup" | "profile" | "message" | "load" | "generic"
): string {
    return getUserFriendlyError(error, context).description;
}
