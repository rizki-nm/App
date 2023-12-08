import React, {ForwardedRef, forwardRef, useContext, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {PopoverContext} from '@components/PopoverProvider';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useStyleUtils from '@styles/useStyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Modal from '@userActions/Modal';
import PopoverWithoutOverlayProps from './types';

function PopoverWithoutOverlay(
    {
        anchorPosition = {},
        anchorRef,
        withoutOverlayRef,
        innerContainerStyle = {},
        outerStyle,
        onModalShow = () => {},
        isVisible,
        onClose,
        onModalHide = () => {},
        children,
    }: PopoverWithoutOverlayProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onOpen, close} = useContext(PopoverContext);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} =
        StyleUtils.getModalStyles(
            'popover',
            {
                windowWidth,
                windowHeight,
                isSmallScreenWidth: false,
            },
            anchorPosition,
            innerContainerStyle,
            outerStyle,
        );

    useEffect(() => {
        let removeOnClose: () => void;
        if (isVisible) {
            onModalShow();
            onOpen?.({
                ref: withoutOverlayRef,
                close: onClose,
                anchorRef,
            });
            removeOnClose = Modal.setCloseModal(() => onClose(anchorRef));
        } else {
            onModalHide();
            close(anchorRef);
            Modal.onModalDidClose();
        }
        Modal.willAlertModalBecomeVisible(isVisible);

        return () => {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const {
        paddingTop: safeAreaPaddingTop,
        paddingBottom: safeAreaPaddingBottom,
        paddingLeft: safeAreaPaddingLeft,
        paddingRight: safeAreaPaddingRight,
    } = useMemo(() => StyleUtils.getSafeAreaPadding(insets), [StyleUtils, insets]);

    const modalPaddingStyles = useMemo(
        () =>
            StyleUtils.getModalPaddingStyles({
                safeAreaPaddingTop,
                safeAreaPaddingBottom,
                safeAreaPaddingLeft,
                safeAreaPaddingRight,
                shouldAddBottomSafeAreaMargin,
                shouldAddTopSafeAreaMargin,
                shouldAddBottomSafeAreaPadding,
                shouldAddTopSafeAreaPadding,
                modalContainerStyleMarginTop: modalContainerStyle.marginTop,
                modalContainerStyleMarginBottom: modalContainerStyle.marginBottom,
                modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
                modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
                insets,
            }),
        [
            StyleUtils,
            insets,
            modalContainerStyle.marginBottom,
            modalContainerStyle.marginTop,
            modalContainerStyle.paddingBottom,
            modalContainerStyle.paddingTop,
            safeAreaPaddingBottom,
            safeAreaPaddingLeft,
            safeAreaPaddingRight,
            safeAreaPaddingTop,
            shouldAddBottomSafeAreaMargin,
            shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaMargin,
            shouldAddTopSafeAreaPadding,
        ],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={withoutOverlayRef}
        >
            <View
                style={{
                    ...styles.defaultModalContainer,
                    ...modalContainerStyle,
                    ...modalPaddingStyles,
                }}
                ref={ref}
            >
                <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
            </View>
        </View>
    );
}

PopoverWithoutOverlay.displayName = 'PopoverWithoutOverlay';

export default forwardRef(PopoverWithoutOverlay);
