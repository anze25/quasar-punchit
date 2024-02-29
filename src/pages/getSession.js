import { supabase } from "src/supabase";

export const getSession = async () => {
  const account = await supabase.auth.getSession();
  user.value = account.data.session.user;
};
