<script lang="ts">
    import Input from '$coreComponents/Form/Input.svelte';
    import Form2 from '$coreComponents/Form/Form2.svelte';
    import Dialog from '$coreComponents/Dialog.svelte';
    import { dateToString } from './functions';
    import type { EventType } from './models';

    function save() {
        if (newEvent) {
            onAddEvent?.();
        } else {
            onEditEvent?.();
        }
    }

    interface Props {
        opened?: boolean;
        event: EventType;
        newEvent?: boolean;
        onAddEvent?: () => any | Promise<any>;
        onEditEvent?: () => any | Promise<any>;
        onDeleteEvent?: () => any | Promise<any>;
    }

    let {
        opened = $bindable(false),
        event = $bindable({} as EventType),
        newEvent = true,
        onAddEvent,
        onEditEvent,
        onDeleteEvent,
    }: Props = $props();
</script>

<Dialog bind:opened title={newEvent ? 'Esemény hozzáadása' : 'Esemény szerkesztése'}>
    <div class="container">
        <Form2
            saveable={newEvent ? 'Esemény hozzáadása' : 'Esemény szerkesztése'}
            deletable={!newEvent}
            onSave={save}
            onDelete={onDeleteEvent}
        >
            <div class="one-line">
                <div class="hs-input-label">Esemény név</div>

                <div class="wrapper">
                    <div class="helper">
                        <Input required bind:value={event.name} />
                    </div>
                    <Input type="color-predefined" bind:value={event.color} />
                </div>
            </div>

            <Input
                title="Esemény kezdete"
                type="datetime-local"
                value={dateToString(event.startDate)}
                required
                oneLine
                onChange={(val) => {
                    let d = new Date(val);
                    event.startDate = isNaN(d) ? new Date() : d;
                }}
            />

            <Input
                title="Esemény vége"
                type="datetime-local"
                value={dateToString(event.endDate)}
                required
                oneLine
                onChange={(val) => {
                    let d = new Date(val);
                    event.endDate = isNaN(d) ? new Date() : d;
                }}
            />
        </Form2>
    </div>
</Dialog>

<style lang="scss">
    .container {
        .one-line {
            .wrapper {
                display: flex;
                gap: 5px;
                .helper {
                    flex-grow: 1;
                }
            }
        }
    }
</style>
