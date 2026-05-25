import { 
  Phone, Mail, Calendar, MessageSquare, 
  CheckCircle, FileText, 
  Users
} from "lucide-react";

export const getActivityIcon = (iconName?: string, className?: string) => {
  const props = { className: className || "size-4" };

  switch (iconName) {
    case "Phone": return <Phone {...props} />;
    case "Mail": return <Mail {...props} />;
    case "Meeting": return <Users {...props} />; 
    case "Calendar": return <Calendar {...props} />;
    case "Message": return <MessageSquare {...props} />;
    case "Task": return <CheckCircle {...props} />;
    default: return <FileText {...props} />;
  }
};