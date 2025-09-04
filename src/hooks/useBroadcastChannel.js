import { useEffect, useState } from "react";

function useBroadcastChannel(name, onMessage, onError) {
	const [channel, setChannel] = useState(null);

	useEffect(() => {
		const channel = new BroadcastChannel(name);
		setChannel(channel);
		return () => channel.close();
	}, [name]);

	useEffect(() => {
		if (!channel) return;
		const messageHandler = e => onMessage?.(e);
		const errorHandler = e => onError?.(e);

		channel.addEventListener("message", messageHandler);
		channel.addEventListener("messageerror", errorHandler);
		return () => {
			channel.removeEventListener("message", messageHandler);
			channel.removeEventListener("messageerror", errorHandler);
		};
	}, [channel, onError, onMessage]);

	return channel;
}

export default useBroadcastChannel;
