export interface MpMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface MpConversation {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  online: boolean;
  lastActive?: string;
  tab: "focused" | "other";
  time: string;
  unread: number;
  messages: MpMessage[];
}

export const initialConversations: MpConversation[] = [
  {
    id: "c1", name: "Sarah Whitfield", role: "Senior Broker · Gulfstream Desk", initials: "SW",
    color: "#5b8def", online: true, tab: "focused", time: "2m", unread: 2,
    messages: [
      { from: "them", text: "Morning — logbooks for the G700 just came back from the maintenance facility.", time: "9:02 AM" },
      { from: "them", text: "Everything checks out clean, no damage history, no AD items outstanding.", time: "9:02 AM" },
      { from: "me", text: "Great news. Can you send the full binder over today?", time: "9:14 AM" },
      { from: "them", text: "Sending it within the hour, along with the updated appraisal.", time: "9:16 AM" },
    ],
  },
  {
    id: "c2", name: "Marcus Lindqvist", role: "Feadship Yacht Sales", initials: "ML",
    color: "#e0a458", online: false, lastActive: "Active 3h ago", tab: "focused", time: "1h", unread: 0,
    messages: [
      { from: "them", text: "Sea trial for the Sabrewing is confirmed for next Thursday out of Rotterdam.", time: "Yesterday 4:40 PM" },
      { from: "me", text: "Perfect, I'll have the buyer's captain fly in Wednesday night.", time: "Yesterday 5:02 PM" },
      { from: "them", text: "Sounds good — I'll send the marina access details shortly.", time: "Yesterday 5:10 PM" },
    ],
  },
  {
    id: "c3", name: "Priya Nair", role: "M1 Concierge", initials: "PN",
    color: "#57b894", online: true, tab: "focused", time: "Yesterday", unread: 0,
    messages: [
      { from: "them", text: "Your appraisal report for the Falcon 8X is ready to view in your dashboard.", time: "Mon 11:20 AM" },
      { from: "me", text: "Thank you, taking a look now.", time: "Mon 11:45 AM" },
    ],
  },
  {
    id: "c4", name: "Antoine Dubreuil", role: "Falcon 10X Owner Rep", initials: "AD",
    color: "#c15b6c", online: false, lastActive: "Active yesterday", tab: "focused", time: "2d", unread: 1,
    messages: [
      { from: "them", text: "Happy to schedule the pre-purchase inspection whenever suits your team.", time: "2d ago" },
    ],
  },
  {
    id: "c5", name: "M1 Partner Circle", role: "Market intelligence digest", initials: "PC",
    color: "#8a7dd9", online: false, tab: "other", time: "3d", unread: 0,
    messages: [
      { from: "them", text: "This week's brief: long-range jet demand up 6% quarter over quarter.", time: "3d ago" },
    ],
  },
];
