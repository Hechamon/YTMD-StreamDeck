import {takeUntil}                                                        from 'rxjs/operators';
import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {StateType}                                                        from 'streamdeck-typescript/dist/src/interfaces/enums';
import {PlayerInfoInterface, TrackAndPlayerInterface}                     from '../interfaces/information.interface';
import {YTMD}                                                             from '../ytmd';
import {DefaultAction}                                                    from './default.action';

export class LikeDislikeAction extends DefaultAction<LikeDislikeAction> {
    constructor(private plugin: YTMD, actionName: string, private likeStatus: PlayerInfoInterface['likeStatus']) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {
        this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => this.handleLikeDislike(event, data));
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent): void {
        this.socket.trackThumbsDown();
    }

    handleLikeDislike({context}: WillAppearEvent, data: TrackAndPlayerInterface) {
        if (Object.keys(data).length === 0) {
            return;
        }

        const correctState: boolean = data.player.likeStatus === this.likeStatus;
        this.plugin.setState(correctState ? StateType.ON : StateType.OFF, context);
    }
}
