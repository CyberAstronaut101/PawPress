<script>
	import { page } from '$app/stores';
</script>

<div class="flex justify-center items-center h-screen">
	<div class="card p-4 items-center">
		<h1>{$page.status} {$page.error?.message}</h1>

		<a class="btn btn-sm variant-ghost-surface" href="/"> Home Page </a>
	</div>
</div>

<!-- 
    
<div class="flex justify-center items-center h-screen m-8 py-9">
    <div class="card p-4">
        <h1>{$page.status} {$page.error?.message}</h1>
    </div>
</div>

 -->
