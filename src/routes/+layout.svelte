<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/user';
  import { startLogin, loadSession, logout } from '$lib/auth/oauth';
  import '../app.css'  
	import { fade } from 'svelte/transition';
  
  let enteredUsername = '';
  let errorMsg = '';
  let showError = false;

  onMount(() => {
    loadSession();
  });

  async function handleLogin() { 
    try {
        await startLogin(enteredUsername);
    } catch (err) {
        console.log('Login error:', err);
        errorMsg = 'Login failed. Please try again. ' + err;
        showError = true;
        setTimeout(() => {
            showError = false;
        }, 5000);
    }
  }
  function handleLogout() { logout(); }
</script>

{#if showError}
  <div
    class="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow-lg"
    transition:fade
  >
    {errorMsg}
  </div>
{/if}

<div class="min-h-screen bg-gray-50">
  <nav class="border-b border-gray-200 bg-white/70 backdrop-blur">
    <div class="mx-auto max-w-6xl px-4">
      <div class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-3">
          <a href="/" class="flex items-center gap-2">
			<img src="/favicon.png" alt="Tophhie Social Logo" class="w-7 rounded">
            <span class="text-sm font-semibold tracking-wide">Tophhie Social Profile</span>
          </a>
        </div>

        <div class="flex items-center gap-3">
          {#if $user}
            <div class="flex items-center gap-2">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs">
                {$user.repo?.handle?.slice(0,1)?.toUpperCase() ?? 'U'}
              </span>
              <span class="hidden sm:inline text-sm text-gray-700">@{$user.repo?.handle ?? $user.did}</span>
              <button on:click={handleLogout}
                      class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
					  style="cursor: pointer">
                Logout
              </button>
            </div>
          {:else}
			<input type="text" bind:value={enteredUsername} placeholder="Enter username"
				   class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
            <button on:click={handleLogin}
                    class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					style="cursor: pointer"
					disabled={!enteredUsername}>
              Login
            </button>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <main class="mx-auto max-w-6xl px-4 py-6">
    <slot />
  </main>
</div>
