<script>
	import { CreateScene } from "$lib/game_scene/scene";
	import { onMount } from "svelte";

	onMount(() => {
		CreateScene();
	});
</script>

<div class="BABYLON">
	<main>
	  <canvas id="renderCanvas"></canvas>
	</main>
  </div>
  
  <style>
	canvas {
	  width: 100vw;
	  height: 100vh;
	  display: block;
	}
	.BABYLON {
	  position: fixed;
	  inset: 0;
	}
	#fps {
		position: absolute;
		background-color: black;
		border: 2px solid red;
		text-align: center;
		font-size: 16px;
		color: white;
		top: 900px;
		right: 10px;
		width: 60px;
		height: 20px;
	}
  </style>


<div id="fps">0</div>
  