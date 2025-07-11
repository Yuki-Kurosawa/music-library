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
				var btn=buttons.find((button)=>button.style !== "cancel");
				if(btn && btn.onPress)
				{
					btn.onPress();
				}
			}
		}
	}
}