import { user, type SessionUser } from '$lib/stores/user';
import { profileRecord } from '$lib/stores/profileRecord';
import { type TophhieSocialProfile } from '$lib/stores/profile';
import { Config } from '$lib/config/config'; // your file
import { BrowserOAuthClient, OAuthSession } from '@atproto/oauth-client-browser';
import { Agent } from '@atproto/api';
import clientMetadata from '$lib/client-metadata.json';

let client: BrowserOAuthClient | null = null;

function getClient() {
    if (!client) {
        client = new BrowserOAuthClient({
            handleResolver: 'https://tophhie.social',
            clientMetadata: clientMetadata as any,
        });
        client.init();
    }
    client?.addEventListener('updated', async (event) => {
        window.location.href = '/';
    });
  return client;
}

export async function startLogin(username: string) {
    const client = getClient();
    await client.signIn(username); // kicks off the redirect with PKCE + DPoP
}

export async function loadSession() {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();

    if (result) {
        const { session, state } = result

        user.subscribe(async (obj) => {
            if (obj == null) {
                const [repo] = await Promise.all([fetchRepo()]);

                const sessionUser: SessionUser = {
                    did: session.did,
                    repo: repo?.data
                }

                user.set(sessionUser);
            }
        });

        if (state != null) {
            console.log(
            `${session.sub} was successfully authenticated (state: ${state})`,
            )
        } else {
            console.log(`${session.sub} was restored (last active session)`)
        }
    }
}

export async function logout() {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();
    if (result) {
        await result.session.signOut();
    }
    user.set(null);
    location.reload();
}

async function fetchRepo() {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();
    if (result) {
        const { session } = result;
        const agent = new Agent(session);
        const repo = agent.com.atproto.repo.describeRepo({ repo: session.did });
        console.log('Fetched repo:', repo);
        return repo;
    }
}

export async function fetchTophhieSocialProfile() {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();
    if (!result) return;
    const { session } = result;
    const agent = new Agent(session);
    try {
        const settings = await agent.com.atproto.repo.getRecord({
            repo: session.did,
            collection: 'social.tophhie.profile',
            rkey: 'self'
        });
        console.log('Fetched Tophhie Social Profile:', settings);
        profileRecord.set(settings.data.value as TophhieSocialProfile);
        return settings.data.value;
    } catch (err: unknown) {
        const e = err as {
            status?: number;
            error?: string;
            message?: string;
            response?: {data?: {error?: string; message?: string}};
        }
        const status = e?.status;
        const topLevelError = e?.error
        const bodyError = e?.response?.data?.error;
        const isRecordNotFound400 =
            status === 400 &&
            (topLevelError === 'RecordNotFound' || bodyError === 'RecordNotFound');

        if (isRecordNotFound400) {
            console.log('Tophhie Social Profile not found, initializing a new one.');
            return await initialiseTophhieSocialProfile();
        }
        throw err;
    }
}

export async function updateTophhieSocialProfile(updatedProfile: TophhieSocialProfile) {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();
    if (result) {
        const { session } = result;
        const agent = new Agent(session);
        try {
            const profile = await agent.com.atproto.repo.putRecord({
                repo: session.did,
                collection: 'social.tophhie.profile',
                rkey: "self",
                record: updatedProfile,
                validate: false
            });
            console.log('Updated Tophhie Social Profile:', profile);
            profileRecord.set(updatedProfile);
            return profile.data;
        } catch (error) {
            console.error('Error updating Tophhie Social Profile:', error);
            throw error;
        }
    }
}

export async function initialiseTophhieSocialProfile() {
    const result: undefined | { session: OAuthSession; state?: string | null } = await getClient().init();

    const record = {
        $type: 'social.tophhie.profile',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        communicationPreferences: {
            marketing: true
        },
        pdsPreferences: {
            accessibilityScoring: true,
            showOnHomepage: true
        }
    } as TophhieSocialProfile

    if (result) {
        const { session } = result;
        const agent = new Agent(session);
        const profile = await agent.com.atproto.repo.putRecord({
            repo: session.did,
            collection: 'social.tophhie.profile',
            rkey: "self",
            record: record,
            validate: false
        });
        console.log('Initialised Tophhie Social Profile:', profile);
        profileRecord.set(record);
        return profile.data;
    }
}