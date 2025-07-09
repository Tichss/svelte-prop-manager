<script lang="ts">
    interface Props {
        active?: boolean;
        onClick?: () => any;
        children?: import('svelte').Snippet;
    }

    let { active, onClick, children }: Props = $props();
</script>

<button class="hidden-button" class:active onclick={onClick}> {@render children?.()} </button>

<style lang="scss">
    .hidden-button {
        background-color: transparent;
        cursor: pointer;
        vertical-align: middle;
        font-size: 0.8rem;
        padding: 2px 8px;
        border: 1px solid white;
        color: inherit;
        border-radius: 4px;

        &:hover {
            background-color: rgb(86, 86, 86);
        }

        &.active {
            color: black;
            background-color: white;
        }

        &:disabled {
            background-color: transparent;
            cursor: not-allowed;

            &:hover {
                background-color: transparent;
            }

            &.active {
                color: rgba(var(--theme-rgb), 0.8);
                background-color: rgba(var(--theme-rgb), 0.05);
            }
        }
    }
</style>
