class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async setRemoteDescription(ans) {
    try {
      if (this.peer) {
        console.log(ans);
        console.log(this.peer.signalingState);
        if (this.peer.signalingState === "have-local-offer") {
          console.log(ans);
          await this.peer.setRemoteDescription({
            type: ans.type,
            sdp: ans.sdp,
          }); // Correctly set answer
        }
      }
    } catch (error) {
      console.error("Failed to set remote description:", error);
    }
  }

  async getAnswer(offer) {
    try {
      if (this.peer) {
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        console.log(answer);
        return answer;
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }

  async getOffers() {
    try {
      if (this.peer) {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }
}

export default new PeerService();
