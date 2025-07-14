import { Alert, AlertButton, AlertOptions, Platform } from 'react-native';

export const AlertWrap = {
	alert: function (title: string, message: string, buttons?: AlertButton[], options?: AlertOptions) {
		if(Platform.OS !== 'web') {
			Alert.alert(title, message, buttons, options);
		}
		else
		{
			if(buttons && buttons.length > 1) {
				var ret=confirm(message);
				console.log(ret);
				console.log(buttons);
				if(ret)
				{
					//trigger positive button
					var btn=buttons.find((button)=>button.style !== "cancel");
					if(btn && btn.onPress)
					{
						btn.onPress();
					}
				}
				else{
					//trigger negative button
					var btn=buttons.find((button)=>button.style === "cancel");
					if(btn && btn.onPress)
					{
						btn.onPress();
					}
				}
			}
			else
			{
				alert(message);
				if(buttons && buttons.length > 0) 
				{
					var btn=buttons.find((button)=>button.style !== "cancel");
					if(btn && btn.onPress)
					{
						btn.onPress();
					}
				}
			}
		}
	},
  prompt: function (
    title: string,
    message: string,
    callbackOrButtons?: ((text: string) => void) | AlertButton[],
    type?: 'plain-text' | 'secure-text' | 'login-password',
    defaultValue?: string,
    placeholder?: string
  ) {
    if (Platform.OS !== 'web') {
      // React Native 平台使用 Alert.prompt
      Alert.prompt(title, message, callbackOrButtons, type, defaultValue, placeholder);
    } else {
      // Web 平台使用原生 prompt
      const text = prompt(`${title}\n${message}`, defaultValue);
      if (typeof callbackOrButtons === 'function') {
        callbackOrButtons(text || '');
      } else if (Array.isArray(callbackOrButtons)) {
        const btn = callbackOrButtons.find(button => button.style !== 'cancel');
		if(btn && btn.onPress)
        {
			btn.onPress(text || '');
		}
      }
    }
  }
}
