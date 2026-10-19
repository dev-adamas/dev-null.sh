import { router } from '@inertiajs/react';

declare global {
    interface Window {
        fathom?: { trackEvent: (name: string) => void };
    }
}

const GUEST_VISIT_TRACKED = 'devnull:guest-visit-tracked';

/**
 * The Fathom events behind the Metrics tab: a visit by someone not signed in, once per browser session, with where it
 * started when that is a profile or a commit (the team's or a member's), for the conversion and referral rates; and a
 * signup, right after an account is created. All come from Fathom, so ad blockers hide the same share of each and the
 * rates between them hold. Fathom's deferred script runs before the app's module script,
 * so it is ready by then, unless it is blocked or left out outside production, and then nothing is sent.
 */
export function trackAnalyticsEvents(): void {
    router.on('navigate', (event) => {
        if (event.detail.page.props.auth.user) {
            return;
        }

        try {
            if (sessionStorage.getItem(GUEST_VISIT_TRACKED) !== null) {
                return;
            }

            sessionStorage.setItem(GUEST_VISIT_TRACKED, '1');
        } catch {
            return;
        }

        window.fathom?.trackEvent('guest-visit');

        const entry = event.detail.page.props.referralEntry;

        if (entry) {
            window.fathom?.trackEvent(`referral-${entry}`);
        }
    });

    router.on('flash', (event) => {
        if (event.detail.flash.signedUp) {
            window.fathom?.trackEvent('signup');
        }
    });
}
