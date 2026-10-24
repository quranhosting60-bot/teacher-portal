-- Teacher ko Pakistan ke din + Pakistan time dikhane ke liye (SQL Editor me run karein)
drop function if exists teacher_classes();
create function teacher_classes()
returns table(class_id uuid, student_name text, pk_days int[], pk_time text)
language sql security definer stable as $$
  select c.id, s.name,
    array(select (((d - 1 + y.sh) % 7) + 7) % 7 + 1 from unnest(c.weekdays) d order by 1),
    to_char(x.pk, 'HH12:MI AM')
  from classes c
  join students s on s.id = c.student_id
  cross join lateral (select ((current_date + c.local_time) at time zone s.tz) at time zone 'Asia/Karachi' as pk) x
  cross join lateral (select (x.pk::date - current_date) as sh) y
  where c.teacher_id = auth.uid();
$$;
